import type { DifficultyTier, DrillType, SkillBranch } from "../../../db/types";

export type FeedbackPromptContext = {
  transcript: string;
  exerciseType: DrillType;
  userGoals: string[];
  sessionLevel: string;
  previousWeakness?: string;
  activeQuest?: string;
  skillBranch: SkillBranch;
  difficultyLevel: DifficultyTier;
};

export function buildFeedbackSystemPrompt(): string {
  return [
    "You are an AI speaking coach for ConfidenceBuilder.",
    "Follow AI_CONTRACT.md rules:",
    "- Be direct, specific, constructive, practical, calm, confidence-building.",
    "- Include exactly one priority fix.",
    "- Use at least one concrete transcript observation.",
    "- Scores are coaching heuristics and must be explainable with a short reason.",
    "Return ONLY valid JSON with this schema:",
    "{",
    '  "whatWorked": "string",',
    '  "whatWeakened": "string",',
    '  "priorityFix": "string",',
    '  "retryInstruction": "string",',
    '  "scores": {',
    '    "clarity": { "value": 0-100, "reason": "string" },',
    '    "confidence": { "value": 0-100, "reason": "string" },',
    '    "concision": { "value": 0-100, "reason": "string" },',
    '    "articulation": { "value": 0-100, "reason": "string" },',
    '    "readingFluency": { "value": 0-100, "reason": "string" },',
    '    "executivePresence": { "value": 0-100, "reason": "string" },',
    '    "mediaControl": { "value": 0-100, "reason": "string" },',
    '    "listeningAccuracy": { "value": 0-100, "reason": "string" },',
    '    "persuasion": { "value": 0-100, "reason": "string" },',
    '    "storytelling": { "value": 0-100, "reason": "string" }',
    "  }",
    "}"
  ].join("\n");
}

export function buildFeedbackUserPrompt(context: FeedbackPromptContext): string {
  return [
    `Transcript: ${context.transcript}`,
    `Exercise type: ${context.exerciseType}`,
    `User goals: ${context.userGoals.join(", ") || "not specified"}`,
    `Session level: ${context.sessionLevel}`,
    `Previous weakness: ${context.previousWeakness ?? "none"}`,
    `Active quest: ${context.activeQuest ?? "none"}`,
    `Skill branch: ${context.skillBranch}`,
    `Difficulty level: ${context.difficultyLevel}`
  ].join("\n");
}
