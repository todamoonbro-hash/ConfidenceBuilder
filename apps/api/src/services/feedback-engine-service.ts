import type { DifficultyTier, DrillType, LlmProvider, ModelPreference, PersonalCoachProfile, SessionMemory, SkillBranch } from "../db/types";
import { buildFeedbackSystemPrompt, buildFeedbackUserPrompt } from "../lib/ai/prompts/feedback-prompts";

type ScoreReason = { value: number; reason: string };

export type PriorityDimension =
  | "clarity"
  | "confidence"
  | "concision"
  | "articulation"
  | "readingFluency"
  | "executivePresence"
  | "mediaControl"
  | "listeningAccuracy"
  | "persuasion"
  | "storytelling";

const ALL_DIMENSIONS: PriorityDimension[] = [
  "clarity",
  "confidence",
  "concision",
  "articulation",
  "readingFluency",
  "executivePresence",
  "mediaControl",
  "listeningAccuracy",
  "persuasion",
  "storytelling"
];

type RawFeedbackResult = {
  whatWorked: string;
  whatWeakened: string;
  priorityFix: string;
  retryInstruction: string;
  identityReinforcement?: string;
  priorityDimension?: PriorityDimension;
  notMeasured?: PriorityDimension[];
  scores: {
    clarity: ScoreReason;
    confidence: ScoreReason;
    concision: ScoreReason;
    articulation: ScoreReason;
    readingFluency: ScoreReason;
    executivePresence: ScoreReason;
    mediaControl: ScoreReason;
    listeningAccuracy: ScoreReason;
    persuasion: ScoreReason;
    storytelling: ScoreReason;
  };
};

export type FeedbackEngineInput = {
  transcript: string;
  exerciseType: DrillType;
  userGoals: string[];
  sessionLevel: string;
  previousWeakness?: string;
  activeQuest?: string;
  skillBranch: SkillBranch;
  difficultyLevel: DifficultyTier;
  personalContext?: PersonalCoachProfile;
  recentMemory?: SessionMemory[];
  modelPreference?: ModelPreference;
};

export type FeedbackEngineOutput = {
  whatWorked: string;
  whatWeakened: string;
  priorityFix: string;
  retryInstruction: string;
  identityReinforcement: string;
  priorityDimension: PriorityDimension;
  notMeasured: PriorityDimension[];
  scores: RawFeedbackResult["scores"];
};

type FeedbackModelConfig = {
  provider: LlmProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveProviderConfig(provider: LlmProvider, model: string): FeedbackModelConfig {
  const providerConfig: Record<LlmProvider, { baseUrl: string; apiKey?: string }> = {
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1/chat/completions",
      apiKey: process.env.OPENAI_API_KEY
    },
    openrouter: {
      baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY
    },
    deepseek: {
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/chat/completions",
      apiKey: process.env.DEEPSEEK_API_KEY
    },
    mistral: {
      baseUrl: process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1/chat/completions",
      apiKey: process.env.MISTRAL_API_KEY
    },
    xai: {
      baseUrl: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1/chat/completions",
      apiKey: process.env.XAI_API_KEY
    },
    groq: {
      baseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY
    },
    together: {
      baseUrl: process.env.TOGETHER_BASE_URL ?? "https://api.together.xyz/v1/chat/completions",
      apiKey: process.env.TOGETHER_API_KEY
    },
    fireworks: {
      baseUrl: process.env.FIREWORKS_BASE_URL ?? "https://api.fireworks.ai/inference/v1/chat/completions",
      apiKey: process.env.FIREWORKS_API_KEY
    },
    anthropic: {
      baseUrl: process.env.ANTHROPIC_OPENAI_COMPAT_BASE_URL ?? "",
      apiKey: process.env.ANTHROPIC_API_KEY
    },
    gemini: {
      baseUrl: process.env.GEMINI_OPENAI_COMPAT_BASE_URL ?? "",
      apiKey: process.env.GEMINI_API_KEY
    },
    local: {
      baseUrl: process.env.LOCAL_LLM_BASE_URL ?? "http://localhost:11434/v1/chat/completions",
      apiKey: process.env.LOCAL_LLM_API_KEY
    }
  };

  const config = providerConfig[provider];
  return { provider, model, baseUrl: config.baseUrl, apiKey: config.apiKey };
}

function resolveFeedbackModelConfigs(preference?: ModelPreference): FeedbackModelConfig[] {
  const primaryProvider = preference?.provider ?? "openai";
  const primaryModel = preference?.model || process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";
  const configs = [resolveProviderConfig(primaryProvider, primaryModel)];

  if (preference?.fallbackProvider && preference.fallbackModel) {
    const fallback = resolveProviderConfig(preference.fallbackProvider, preference.fallbackModel);
    if (fallback.provider !== primaryProvider || fallback.model !== primaryModel) {
      configs.push(fallback);
    }
  }

  return configs;
}

function safeJsonParse(rawText: string): unknown {
  // Models often wrap JSON in code fences or include preamble. Strip code fences and extract first {...} block.
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("feedback_parse_failed:invalid_JSON");
  }
}

function normalizeScore(input: unknown, dimension: PriorityDimension, notMeasured: PriorityDimension[]): ScoreReason {
  const raw = input as { value?: number | null; reason?: string } | null | undefined;
  const reason = typeof raw?.reason === "string" ? raw.reason.slice(0, 400) : "";
  if (raw?.value === null || raw?.value === undefined || Number.isNaN(Number(raw?.value))) {
    notMeasured.push(dimension);
    // Keep value as 0 for backward-compat with consumers that expect a number; reason carries the truth.
    return { value: 0, reason: reason || "not_measured" };
  }
  return { value: clampScore(Number(raw.value)), reason };
}

function isPriorityDimension(value: unknown): value is PriorityDimension {
  return typeof value === "string" && ALL_DIMENSIONS.includes(value as PriorityDimension);
}

export function parseFeedbackResponse(rawText: string): FeedbackEngineOutput {
  const parsed = safeJsonParse(rawText) as Partial<RawFeedbackResult>;
  if (!parsed || typeof parsed !== "object" || !parsed.scores) {
    throw new Error("feedback_parse_failed:missing_scores");
  }

  const notMeasured: PriorityDimension[] = [];
  const scores = {
    clarity: normalizeScore(parsed.scores.clarity, "clarity", notMeasured),
    confidence: normalizeScore(parsed.scores.confidence, "confidence", notMeasured),
    concision: normalizeScore(parsed.scores.concision, "concision", notMeasured),
    articulation: normalizeScore(parsed.scores.articulation, "articulation", notMeasured),
    readingFluency: normalizeScore(parsed.scores.readingFluency, "readingFluency", notMeasured),
    executivePresence: normalizeScore(parsed.scores.executivePresence, "executivePresence", notMeasured),
    mediaControl: normalizeScore(parsed.scores.mediaControl, "mediaControl", notMeasured),
    listeningAccuracy: normalizeScore(parsed.scores.listeningAccuracy, "listeningAccuracy", notMeasured),
    persuasion: normalizeScore(parsed.scores.persuasion, "persuasion", notMeasured),
    storytelling: normalizeScore(parsed.scores.storytelling, "storytelling", notMeasured)
  };

  // Pick a priority dimension: trust the model's choice if valid; otherwise the lowest measured score.
  let priorityDimension: PriorityDimension | undefined = isPriorityDimension(parsed.priorityDimension)
    ? parsed.priorityDimension
    : undefined;
  if (!priorityDimension) {
    const measured = ALL_DIMENSIONS.filter((d) => !notMeasured.includes(d));
    priorityDimension = measured.reduce<PriorityDimension>(
      (worst, dim) => (scores[dim].value < scores[worst].value ? dim : worst),
      measured[0] ?? "clarity"
    );
  }

  return {
    whatWorked: typeof parsed.whatWorked === "string" ? parsed.whatWorked : "",
    whatWeakened: typeof parsed.whatWeakened === "string" ? parsed.whatWeakened : "",
    priorityFix: typeof parsed.priorityFix === "string" ? parsed.priorityFix : "",
    retryInstruction: typeof parsed.retryInstruction === "string" ? parsed.retryInstruction : "",
    identityReinforcement: typeof parsed.identityReinforcement === "string" ? parsed.identityReinforcement : "",
    priorityDimension,
    notMeasured,
    scores
  };
}

function buildLocalFeedback(input: FeedbackEngineInput, reason?: string): FeedbackEngineOutput {
  const words = input.transcript.trim().split(/\s+/).filter(Boolean);
  const lower = input.transcript.toLowerCase();
  const fillerCount = words.filter((word) => ["um", "uh", "like", "basically", "actually"].includes(word.replace(/[^\w]/g, ""))).length;
  const hasStructure = ["first", "second", "because", "therefore", "recommend", "point"].some((marker) => lower.includes(marker));
  const hasConcreteDetail = /\d|%|\$|because|example|customer|revenue|risk|timeline/.test(lower);
  const lengthScore = words.length < 8 ? 48 : words.length <= 90 ? 78 : Math.max(45, 95 - Math.round((words.length - 90) / 3));
  const clarity = clampScore(lengthScore + (hasStructure ? 10 : -6));
  const concision = clampScore(words.length <= 75 ? 82 : 100 - Math.round((words.length - 75) / 2));
  const confidenceFromDelivery = clampScore(74 - fillerCount * 4 + (lower.includes("recommend") ? 8 : 0));
  const evidence = clampScore(62 + (hasConcreteDetail ? 16 : -8));

  const providerNote = reason ? " Local fallback used because the AI provider was unavailable." : "";
  const identity = input.personalContext?.speakingIdentity?.trim() || "a calm, clear, direct speaker";

  // Honest scoring: dimensions we cannot measure from transcript-only data are flagged not_measured.
  // readingFluency requires a source passage; listeningAccuracy requires a source prompt; mediaControl
  // requires key-message comparison. We do not invent numbers for these in fallback mode.
  const isReadingExercise = input.exerciseType === "read_aloud";
  const isListeningExercise = input.exerciseType === "listening_response";
  const isMediaExercise = input.skillBranch === "media";

  const notMeasured: PriorityDimension[] = [];
  const measureOrSkip = (
    dimension: PriorityDimension,
    isMeasured: boolean,
    measured: ScoreReason,
    notMeasuredReason: string
  ): ScoreReason => {
    if (!isMeasured) {
      notMeasured.push(dimension);
      return { value: 0, reason: notMeasuredReason };
    }
    return measured;
  };

  const scores = {
    clarity: { value: clarity, reason: hasStructure ? "Clear structure markers were present." : "The main point needs to land earlier." },
    confidence: { value: confidenceFromDelivery, reason: fillerCount > 0 ? "Filler words reduced delivery polish (this is a delivery proxy, not a measure of inner state)." : "Delivery reads as reasonably direct." },
    concision: { value: concision, reason: words.length <= 75 ? "Length is controlled." : "The answer is longer than ideal for a pressure rep." },
    articulation: { value: clampScore(70 - fillerCount * 3), reason: "Estimated from transcript cleanliness and filler usage." },
    readingFluency: measureOrSkip(
      "readingFluency",
      isReadingExercise,
      { value: clampScore(words.length >= 30 ? 72 : 60), reason: "Estimated from transcript length and pace." },
      "not_measured: read-aloud source text required for fluency scoring."
    ),
    executivePresence: { value: clampScore((clarity + confidenceFromDelivery + evidence) / 3), reason: "Based on directness, structure, and proof." },
    mediaControl: measureOrSkip(
      "mediaControl",
      isMediaExercise,
      { value: clampScore((clarity + concision) / 2), reason: "Estimated from message brevity and clarity." },
      "not_measured: media key messages required for message-control scoring."
    ),
    listeningAccuracy: measureOrSkip(
      "listeningAccuracy",
      isListeningExercise,
      { value: clampScore((clarity + concision) / 2), reason: "Estimated from response coherence." },
      "not_measured: a source prompt is required for listening-accuracy scoring."
    ),
    persuasion: { value: evidence, reason: hasConcreteDetail ? "Concrete support was present." : "More proof would strengthen persuasion." },
    storytelling: { value: clampScore(62 + (lower.includes("example") ? 10 : 0)), reason: "Estimated from whether a usable example was included." }
  };

  // Priority dimension = the lowest-scoring dimension we actually measured.
  const measuredDims = ALL_DIMENSIONS.filter((d) => !notMeasured.includes(d));
  const priorityDimension: PriorityDimension = measuredDims.reduce<PriorityDimension>(
    (worst, dim) => (scores[dim].value < scores[worst].value ? dim : worst),
    measuredDims[0] ?? "clarity"
  );

  return {
    whatWorked: hasStructure
      ? `You gave the answer some structure and made it easier to follow.${providerNote}`
      : `You completed the rep and gave enough material to coach from.${providerNote}`,
    whatWeakened: fillerCount > 0
      ? "Filler words reduced authority and made the answer sound less deliberate."
      : words.length > 90
        ? "The answer ran long, which weakens impact under pressure."
        : "The answer needs a sharper main point and more concrete proof.",
    priorityFix: "Lead with one clear point, then add one reason and one specific example.",
    retryInstruction: "Retry in 45 seconds using: point, because, example, next step.",
    identityReinforcement: `One small step toward being ${identity}: land your headline in the first sentence next time.`,
    priorityDimension,
    notMeasured,
    scores
  };
}

async function requestProviderFeedback(config: FeedbackModelConfig, input: FeedbackEngineInput, timeoutMs: number): Promise<FeedbackEngineOutput> {

  if (!config.baseUrl) {
    throw new Error(`provider_not_configured:${config.provider}`);
  }

  if (!config.apiKey && config.provider !== "local") {
    throw new Error(`missing_provider_api_key:${config.provider}`);
  }

  const payload = {
    model: config.model,
    messages: [
      { role: "system", content: buildFeedbackSystemPrompt() },
      { role: "user", content: buildFeedbackUserPrompt(input) }
    ],
    temperature: 0.2
  };

  const headers: Record<string, string> = {
    "content-type": "application/json"
  };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    // Read body for our logs but never embed raw upstream text in the thrown message that may surface to clients.
    let detailSnippet = "";
    try {
      const text = await response.text();
      detailSnippet = text.slice(0, 200).replace(/[\r\n\t]+/g, " ");
    } catch {
      detailSnippet = "<unreadable>";
    }
    const code =
      response.status === 401 || response.status === 403
        ? "auth"
        : response.status === 429
          ? "rate_limited"
          : response.status >= 500
            ? "upstream_unavailable"
            : "bad_response";
    throw new Error(`feedback_provider_failed:${config.provider}:${response.status}:${code}:${detailSnippet}`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("feedback_empty_response");
  }

  return parseFeedbackResponse(content);
}

export async function generateAiFeedback(input: FeedbackEngineInput): Promise<FeedbackEngineOutput> {
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? "30000");
  const configs = resolveFeedbackModelConfigs(input.modelPreference);
  const failures: string[] = [];

  for (const config of configs) {
    try {
      return await requestProviderFeedback(config, input, timeoutMs);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  return buildLocalFeedback(input, failures.join(" | "));
}
