import assert from "node:assert/strict";
import { DIFFICULT_SCENARIOS } from "../dist/services/difficult-conversations-data-service.js";
import { startDifficultConversationSession, appendDifficultConversationTurn, endDifficultConversationSession } from "../dist/services/difficult-conversations-engine-service.js";

assert.equal(DIFFICULT_SCENARIOS.length, 12);

const started = startDifficultConversationSession({
  userId: "user_001",
  scenarioId: "dc_001",
  framework: "Boundary script",
  toneTarget: "firm",
  personaStyle: "evasive",
  pressureMode: true
});
assert.equal(started.ok, true);

const turn = appendDifficultConversationTurn({
  sessionId: started.session.id,
  answer: "I appreciate the context. We need payment by Friday to continue work next week. If not, we pause delivery and reset terms."
});
assert.equal(turn.ok, true);

const ended = endDifficultConversationSession({ sessionId: started.session.id, userId: "user_001" });
assert.equal(ended.ok, true);
assert.ok(ended.report.scores.clarity > 0);
assert.equal(typeof ended.report.feedback.noClearAsk, "boolean");

console.log("Difficult conversations tests passed.");
