import assert from "node:assert/strict";
import { evaluateExecutiveResponse, startExecutiveSimulation } from "../dist/services/executive-simulations-service.js";

const simulation = startExecutiveSimulation({ mode: "board_update", style: "challenging" });
assert.equal(simulation.mode, "board_update");
assert.equal(simulation.style, "challenging");

const first = evaluateExecutiveResponse({
  mode: simulation.mode,
  style: simulation.style,
  question: simulation.openingQuestion,
  transcript: "We need to improve and do better soon."
});

assert.equal(first.total > 0, true);
assert.equal(typeof first.followUpQuestion, "string");

const retry = evaluateExecutiveResponse({
  mode: simulation.mode,
  style: simulation.style,
  question: simulation.openingQuestion,
  transcript: "First, our plan protects margin and risk control. Second, we will tighten execution cadence and weekly accountability. I recommend one measurable commitment in thirty days.",
  previousTranscript: "We need to improve and do better soon."
});

assert.equal(retry.improvement?.delta >= 0, true);
assert.equal(retry.xpAward >= 15, true);

console.log("Executive simulations tests passed.");
