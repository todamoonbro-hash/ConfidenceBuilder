import { readFile } from "node:fs/promises";

const raw = await readFile(new URL("../db/seed-data.json", import.meta.url), "utf-8");
const db = JSON.parse(raw);

if (!Array.isArray(db.trainingLevels) || db.trainingLevels.length < 4) {
  throw new Error("Expected default training levels in seed data.");
}

if (!db.exercises.some((item) => item.drillType === "articulation")) {
  throw new Error("Missing articulation drills in seed data.");
}

if (!db.exercises.some((item) => item.drillType === "read_aloud")) {
  throw new Error("Missing read-aloud passages in seed data.");
}

if (!db.exercises.some((item) => item.drillType === "impromptu")) {
  throw new Error("Missing impromptu prompts in seed data.");
}

if (!db.quests?.length || db.quests.length < 7) {
  throw new Error("Missing starter quests.");
}

for (const quest of db.quests) {
  if (!Array.isArray(quest.steps) || quest.steps.length < 3 || quest.steps.length > 5) {
    throw new Error(`Quest ${quest.id} must have 3-5 steps.`);
  }

  if (!quest.steps.some((step) => step.isBoss === true)) {
    throw new Error(`Quest ${quest.id} must include a boss-style final challenge.`);
  }
}

if (!db.dailyMissions?.length || !db.badges?.length || !db.weeklyBossChallenges?.length) {
  throw new Error("Missing gamification seed sections.");
}

console.log("Seed verification passed.");
console.log(
  JSON.stringify(
    {
      users: db.users.length,
      quests: db.quests.length,
      dailyMissions: db.dailyMissions.length,
      badges: db.badges.length,
      weeklyBossChallenges: db.weeklyBossChallenges.length
    },
    null,
    2
  )
);
