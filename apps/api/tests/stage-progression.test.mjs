import assert from "node:assert/strict";
import { getDatabase } from "../dist/db/store.js";
import { computeStageProgression } from "../dist/services/stage-progression-service.js";

const db = getDatabase();
const progress = db.gameProgressions.find((item) => item.userId === "user_001");
if (!progress) {
  throw new Error("Expected user progress in seed");
}

const staged = computeStageProgression(db, {
  ...progress,
  overallXp: progress.overallXp + 600,
  streakDays: Math.max(progress.streakDays, 5),
  skillXp: {
    ...progress.skillXp,
    confidence: progress.skillXp.confidence + 220,
    executive: progress.skillXp.executive + 180
  }
});

assert.equal(staged.level >= 1 && staged.level <= 10, true);
assert.equal(typeof staged.levelTitle, "string");
assert.equal(typeof staged.nextMilestone, "string");
assert.equal(Array.isArray(staged.unlockedFeatures), true);
assert.equal(typeof staged.nextSkillFocus, "string");

console.log("Stage progression tests passed.");
