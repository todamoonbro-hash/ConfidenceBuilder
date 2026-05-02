import type { DatabaseSnapshot } from "./types";

import seedData from "./seed-data.json";

export function createSeedSnapshot(): DatabaseSnapshot {
  const snapshot = seedData as unknown as DatabaseSnapshot;

  return {
    ...snapshot,
    personalCoachProfiles: snapshot.personalCoachProfiles ?? [
      {
        id: "pcp_001",
        userId: "user_001",
        primaryGoal: "Become clearer, calmer, and more concise in high-stakes professional conversations.",
        targetSituations: ["executive updates", "interviews", "difficult conversations"],
        knownWeaknesses: ["rambling", "not landing the main point early", "filler words under pressure"],
        speakingIdentity: "Calm, concise, commercially sharp leader",
        coachStrictness: "direct",
        weeklyPracticeMinutes: 100,
        currentRealWorldEvent: "Quarterly business review in two weeks",
        accentOrLanguageNotes: "",
        updatedAt: new Date().toISOString()
      }
    ],
    modelPreferences: snapshot.modelPreferences ?? [
      {
        task: "feedback",
        provider: "deepseek",
        model: "deepseek-chat",
        costMode: "lowest_cost",
        enabled: true,
        fallbackProvider: "mistral",
        fallbackModel: "mistral-small-latest"
      },
      {
        task: "transcription",
        provider: "openai",
        model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-mini-transcribe",
        costMode: "balanced",
        enabled: true
      },
      {
        task: "deepReview",
        provider: "mistral",
        model: "mistral-small-latest",
        costMode: "lowest_cost",
        enabled: true,
        fallbackProvider: "openrouter",
        fallbackModel: "deepseek/deepseek-chat"
      },
      {
        task: "cheapScoring",
        provider: "deepseek",
        model: "deepseek-chat",
        costMode: "lowest_cost",
        enabled: true,
        fallbackProvider: "openai",
        fallbackModel: "gpt-4.1-mini"
      },
      {
        task: "realtimeCoach",
        provider: "openai",
        model: process.env.OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview",
        costMode: "balanced",
        enabled: true
      }
    ],
    sessionMemories: snapshot.sessionMemories ?? []
  };
}
