import assert from "node:assert/strict";
import { appendRealtimeTurn, endRealtimeCoachSession, startRealtimeCoachSession } from "../dist/services/realtime-voice-coach-service.js";

const started = startRealtimeCoachSession({ userId: "user_001", mode: "interview_simulation" });
assert.equal(typeof started.sessionId, "string");
assert.equal(started.fallbackEnabled, true);

const turn = appendRealtimeTurn({
  sessionId: started.sessionId,
  userText: "I recommend a focused execution plan with clear accountability."
});

assert.equal(turn.ok, true);
if (!turn.ok) {
  throw new Error("Expected turn to succeed");
}
assert.equal(typeof turn.coachReply, "string");

const ended = endRealtimeCoachSession({ sessionId: started.sessionId });
assert.equal(ended.ok, true);
if (!ended.ok) {
  throw new Error("Expected end to succeed");
}
assert.equal(Array.isArray(ended.transcript), true);
assert.equal(typeof ended.summary.priorityFix, "string");

console.log("Realtime voice coach tests passed.");
