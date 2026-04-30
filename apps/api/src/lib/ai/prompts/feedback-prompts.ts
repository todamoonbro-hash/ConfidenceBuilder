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
  personalContext?: {
    primaryGoal: string;
    targetSituations: string[];
    knownWeaknesses: string[];
    speakingIdentity: string;
    coachStrictness: string;
    currentRealWorldEvent?: string;
    accentOrLanguageNotes?: string;
  };
  recentMemory?: Array<{
    situation: string;
    observedWeakness: string;
    priorityFix: string;
    nextDrill: string;
    scoreTotal?: number;
  }>;
};

export function buildFeedbackSystemPrompt(): string {
  return [
    "You are an AI speaking coach for ConfidenceBuilder.",
    "Follow AI_CONTRACT.md rules:",
    "- Be direct, specific, constructive, practical, calm, confidence-building.",
    "- Include exactly one priority fix.",
    "- Use at least one concrete transcript observation.",
    "- Adapt feedback to the user's personal goal, real-world situation, and known weaknesses when provided.",
    "- Keep advice cost-effective: avoid asking for unnecessary long AI sessions when a short retry drill is enough.",
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
    `Difficulty level: ${context.difficultyLevel}`,
    context.personalContext
      ? [
          "Personal coach profile:",
          `- Primary goal: ${context.personalContext.primaryGoal}`,
          `- Target situations: ${context.personalContext.targetSituations.join(", ") || "not specified"}`,
          `- Known weaknesses: ${context.personalContext.knownWeaknesses.join(", ") || "not specified"}`,
          `- Desired speaking identity: ${context.personalContext.speakingIdentity}`,
          `- Coaching strictness: ${context.personalContext.coachStrictness}`,
          `- Current real-world event: ${context.personalContext.currentRealWorldEvent ?? "none"}`,
          `- Accent/language notes: ${context.personalContext.accentOrLanguageNotes ?? "none"}`
        ].join("\n")
      : "Personal coach profile: not configured",
    context.recentMemory && context.recentMemory.length > 0
      ? [
          "Recent coaching memory:",
          ...context.recentMemory.map(
            (item, index) =>
              `${index + 1}. ${item.situation} | weakness: ${item.observedWeakness} | fix: ${item.priorityFix} | next: ${item.nextDrill} | score: ${item.scoreTotal ?? "n/a"}`
          )
        ].join("\n")
      : "Recent coaching memory: none"
  ].join("\n");
}
