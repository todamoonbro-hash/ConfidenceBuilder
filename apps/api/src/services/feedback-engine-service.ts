import type { DifficultyTier, DrillType, SkillBranch } from "../db/types";
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
};

export type FeedbackEngineOutput = RawFeedbackResult;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
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
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_FEEDBACK_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("missing_openai_api_key");
  }

  const payload = {
    model,
    messages: [
      { role: "system", content: buildFeedbackSystemPrompt() },
      { role: "user", content: buildFeedbackUserPrompt(input) }
    ],
    temperature: 0.2
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`openai_feedback_failed:${response.status}:${details}`);
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
