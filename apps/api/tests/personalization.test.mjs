import assert from "node:assert/strict";

import {
  getModelPreferenceForTask,
  getModelPreferences,
  getPersonalCoachProfileByUser,
  getSessionMemoriesByUser,
  savePersonalCoachProfile,
  saveSessionMemory
} from "../dist/db/store.js";

const profile = savePersonalCoachProfile({
  userId: "user_001",
  primaryGoal: "Get concise and calm in executive updates.",
  targetSituations: ["board update", "interview"],
  knownWeaknesses: ["rambling", "weak landing line"],
  speakingIdentity: "Concise operator",
  coachStrictness: "direct",
  weeklyPracticeMinutes: 90,
  currentRealWorldEvent: "budget review",
  accentOrLanguageNotes: ""
});

assert.equal(profile.userId, "user_001");
assert.equal(getPersonalCoachProfileByUser("user_001")?.speakingIdentity, "Concise operator");

const preferences = getModelPreferences();
assert.ok(preferences.length >= 1);
assert.equal(getModelPreferenceForTask("feedback")?.task, "feedback");

const memory = saveSessionMemory({
  userId: "user_001",
  attemptId: "att_001",
  skillBranch: "confidence",
  situation: "Executive update",
  modelProvider: "openai",
  modelName: "gpt-4.1-mini",
  transcriptSummary: "I recommend we approve the plan because it reduces risk.",
  observedWeakness: "Too much setup before the recommendation.",
  priorityFix: "Lead with the recommendation first.",
  nextDrill: "Retry in 45 seconds using recommendation, reason, risk.",
  scoreTotal: 76
});

assert.equal(memory.priorityFix, "Lead with the recommendation first.");
assert.equal(getSessionMemoriesByUser("user_001", 1)[0].id, memory.id);

console.log("Personalization tests passed.");
