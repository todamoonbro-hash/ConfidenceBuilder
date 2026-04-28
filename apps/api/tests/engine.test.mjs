import assert from "node:assert/strict";
import { findUnlockableBadges } from "../dist/services/badge-unlock-service.js";
import { adjustDifficulty } from "../dist/services/difficulty-adjustment-service.js";
import { calculateLevel, applyXpToProgress } from "../dist/services/level-progression-service.js";
import { advanceQuestStep } from "../dist/services/quest-progress-service.js";
import { generateAdaptiveDailyPlan } from "../dist/services/training-plan-generator-service.js";
import { calculateXpRewards } from "../dist/services/xp-calculation-service.js";

const progress = {
  id: "gp_test",
  userId: "user_test",
  overallXp: 240,
  level: 3,
  streakDays: 2,
  currentDifficulty: "Moderate",
  skillXp: {
    confidence: 30,
    articulation: 20,
    reading: 25,
    impromptu: 18,
    listening: 10,
    executive: 16,
    media: 5,
    presentation: 14,
    storytelling: 8,
    persuasion: 12
  },
  recentPerformanceScores: [62, 72, 84]
};

const activeQuestStep = {
  id: "q_step",
  title: "Quest Step",
  description: "Complete this specific exercise.",
  exerciseId: "ex_imp_001",
  targetSkill: "impromptu",
  xpReward: 30,
  isBoss: false
};

const plan = generateAdaptiveDailyPlan({ userId: "user_test", today: "2026-04-27", progress, activeQuestStep });
assert.equal(plan.steps.length, 5);
assert.ok(plan.steps.some((step) => step.linkedQuestStepId === "q_step"));
assert.ok(plan.totalXpReward > 0);

const reward = calculateXpRewards("Moderate", 80, "confidence");
const progressed = applyXpToProgress(progress, reward.overallXp, reward.skillXp);
assert.equal(progressed.level, calculateLevel(progressed.overallXp));

const unlocked = findUnlockableBadges(
  { ...progressed, streakDays: 3 },
  [
    { id: "b1", title: "First", description: "", requirement: "first_session" },
    { id: "b2", title: "Streak", description: "", requirement: "streak_threshold", threshold: 3 }
  ],
  [],
  "2026-04-27T00:00:00.000Z"
);
assert.equal(unlocked.length, 2);

assert.equal(adjustDifficulty("Moderate", [85, 88, 90]), "Challenging");
assert.equal(adjustDifficulty("Moderate", [45, 50, 52]), "Easy");

const quest = {
  id: "quest_1",
  title: "Quest",
  description: "",
  targetSkill: "impromptu",
  minLevel: 1,
  completionXpReward: 100,
  steps: [activeQuestStep]
};
const questProgress = {
  id: "uqp_1",
  userId: "user_test",
  questId: "quest_1",
  status: "active",
  currentStepIndex: 0,
  completedStepIds: []
};

const advanced = advanceQuestStep(questProgress, quest, "ex_imp_001");
assert.equal(advanced.stepCompleted, true);
assert.equal(advanced.questCompleted, true);

console.log("Engine tests passed.");
