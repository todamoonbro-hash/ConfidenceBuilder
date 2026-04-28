import assert from "node:assert/strict";

import { createSeedSnapshot } from "../dist/db/seed-data.js";
import { buildAdaptiveCoachOverview } from "../dist/services/adaptive-coach-service.js";

const snapshot = createSeedSnapshot();
const overview = buildAdaptiveCoachOverview(snapshot, "user_001");

assert.equal(overview.taxonomy.length, 22);
assert.equal(overview.recommendedDrills.length, 3);
assert.equal(Array.isArray(overview.weaknessMap.lowestScoringSkills), true);
assert.equal(typeof overview.weeklyReviews.sessionsCompleted, "number");
assert.equal(Array.isArray(overview.userSkillTree), true);

console.log("Adaptive coach overview tests passed.");
