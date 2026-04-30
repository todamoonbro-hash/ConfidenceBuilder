import type { DifficultyTier, DrillType, LlmProvider, ModelPreference, PersonalCoachProfile, SessionMemory, SkillBranch } from "../db/types";
import { buildFeedbackSystemPrompt, buildFeedbackUserPrompt } from "../lib/ai/prompts/feedback-prompts";

type ScoreReason = { value: number; reason: string };

type RawFeedbackResult = {
  whatWorked: string;
  whatWeakened: string;
  priorityFix: string;
  retryInstruction: string;
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

export type FeedbackEngineOutput = RawFeedbackResult;

type FeedbackModelConfig = {
  provider: LlmProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveFeedbackModelConfig(preference?: ModelPreference): FeedbackModelConfig {
  const provider = preference?.provider ?? "openai";
  const model = preference?.model || process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";

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

export function parseFeedbackResponse(rawText: string): FeedbackEngineOutput {
  const parsed = JSON.parse(rawText) as RawFeedbackResult;

  const normalized: FeedbackEngineOutput = {
    whatWorked: parsed.whatWorked,
    whatWeakened: parsed.whatWeakened,
    priorityFix: parsed.priorityFix,
    retryInstruction: parsed.retryInstruction,
    scores: {
      clarity: { value: clampScore(parsed.scores.clarity.value), reason: parsed.scores.clarity.reason },
      confidence: { value: clampScore(parsed.scores.confidence.value), reason: parsed.scores.confidence.reason },
      concision: { value: clampScore(parsed.scores.concision.value), reason: parsed.scores.concision.reason },
      articulation: { value: clampScore(parsed.scores.articulation.value), reason: parsed.scores.articulation.reason },
      readingFluency: { value: clampScore(parsed.scores.readingFluency.value), reason: parsed.scores.readingFluency.reason },
      executivePresence: { value: clampScore(parsed.scores.executivePresence.value), reason: parsed.scores.executivePresence.reason },
      mediaControl: { value: clampScore(parsed.scores.mediaControl.value), reason: parsed.scores.mediaControl.reason },
      listeningAccuracy: { value: clampScore(parsed.scores.listeningAccuracy.value), reason: parsed.scores.listeningAccuracy.reason },
      persuasion: { value: clampScore(parsed.scores.persuasion.value), reason: parsed.scores.persuasion.reason },
      storytelling: { value: clampScore(parsed.scores.storytelling.value), reason: parsed.scores.storytelling.reason }
    }
  };

  return normalized;
}

export async function generateAiFeedback(input: FeedbackEngineInput): Promise<FeedbackEngineOutput> {
  const config = resolveFeedbackModelConfig(input.modelPreference);
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? "30000");

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
    const details = await response.text();
    throw new Error(`feedback_provider_failed:${config.provider}:${response.status}:${details}`);
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
