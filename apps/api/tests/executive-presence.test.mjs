import assert from "node:assert/strict";
import { EXECUTIVE_SCENARIOS } from "../dist/services/executive-presence-data-service.js";
import { startExecutivePresenceSession, appendExecutivePresenceTurn, endExecutivePresenceSession } from "../dist/services/executive-presence-engine-service.js";

assert.equal(EXECUTIVE_SCENARIOS.length, 12);

const started = startExecutivePresenceSession({
  userId: "user_001",
  scenarioId: "ep_001",
  framework: "BLUF",
  pressureMode: true,
  timeLimitSeconds: 30
});
assert.equal(started.ok, true);

const turn = appendExecutivePresenceTurn({
  sessionId: started.session.id,
  answer: "My recommendation is to prioritize two turnaround levers now. Revenue mix improved by 6% in pilot regions and we can scale in 45 days.",
  elapsedSeconds: 22
});
assert.equal(turn.ok, true);

const ended = endExecutivePresenceSession({ sessionId: started.session.id, userId: "user_001" });
assert.equal(ended.ok, true);
assert.ok(ended.report.executivePresenceScore > 0);
assert.equal(typeof ended.report.checks.clearRecommendation, "boolean");

console.log("Executive presence tests passed.");
