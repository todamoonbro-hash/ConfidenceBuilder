import assert from "node:assert/strict";
import { evaluateCrisisAnswer, startCrisisSimulation } from "../dist/services/crisis-simulator-service.js";

const simulation = startCrisisSimulation("board_challenge");
assert.equal(simulation.openingQuestion.length > 0, true);

const first = evaluateCrisisAnswer({
  question: simulation.openingQuestion,
  transcript: "I think maybe we can probably improve soon."
});

assert.equal(first.total > 0, true);
assert.equal(typeof first.oneFix, "string");
assert.equal(typeof first.shouldRetry, "boolean");

const retry = evaluateCrisisAnswer({
  question: simulation.openingQuestion,
  transcript: "What matters most is disciplined execution. We made mistakes, and the plan is to fix them in 30 days.",
  previousTranscript: "I think maybe we can probably improve soon."
});

assert.equal(retry.improvement?.delta >= 0, true);
assert.equal(retry.xpAward >= 16, true);

console.log("Crisis simulator tests passed.");
