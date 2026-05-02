import assert from "node:assert/strict";

import { completeBossChallenge, getBossChallengesForUser, startBossChallenge } from "../dist/db/store.js";

const userId = "user_001";
const challenges = getBossChallengesForUser(userId);
assert.ok(challenges.length > 0);

const available = challenges.find((item) => !item.locked);
assert.ok(available);

const started = startBossChallenge(userId, available.challenge.id);
assert.ok(started);
assert.equal(started.userId, userId);
assert.equal(started.challengeId, available.challenge.id);
assert.equal(started.outcome, "in_progress");

const completed = completeBossChallenge(started.id, 82);
assert.ok(completed);
assert.equal(completed.outcome, "pass");
assert.ok(completed.xpGranted > 0);

console.log("Boss challenge wiring tests passed.");
