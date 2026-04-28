import assert from "node:assert/strict";
import { NETWORKING_SCENARIOS } from "../dist/services/networking-data-service.js";
import { startNetworkingSession, appendNetworkingTurn, endNetworkingSession } from "../dist/services/networking-engine-service.js";

assert.equal(NETWORKING_SCENARIOS.length, 12);

const started = startNetworkingSession({ userId: "user_001", scenarioId: "net_001", framework: "Warm opener: context, observation, question", persona: "conference_attendee" });
assert.equal(started.ok, true);

const turn = appendNetworkingTurn({ sessionId: started.session.id, text: "Great to meet you — I liked your point on scaling teams. What projects are you most focused on this quarter?" });
assert.equal(turn.ok, true);

const ended = endNetworkingSession({ sessionId: started.session.id, userId: "user_001" });
assert.equal(ended.ok, true);
assert.ok(ended.report.rapportScore > 0);
assert.equal(typeof ended.report.desperationDetector.triggered, "boolean");

console.log("Networking tests passed.");
