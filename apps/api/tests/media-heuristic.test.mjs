import assert from "node:assert/strict";
import { scoreMediaHeuristic } from "../dist/services/media-heuristic-service.js";

const result = scoreMediaHeuristic({
  transcript: "What matters most is customer safety. To be clear, we are focused on facts and support.",
  keyMessages: ["customer safety", "focus on facts", "support impacted users"],
  durationSeconds: 20,
  selfCalmnessRating: 4
});

assert.equal(result.total > 0, true);
assert.equal(result.scores.messageControl > 0, true);
assert.equal(result.scores.bridgeQuality >= 40, true);

const risky = scoreMediaHeuristic({
  transcript: "No comment. I think maybe this is probably fine.",
  keyMessages: ["safety first"],
  durationSeconds: 10,
  selfCalmnessRating: 2
});

assert.equal(risky.scores.speculationRisk > 0, true);
assert.equal(risky.scores.defensivenessRisk > 0, true);

console.log("Media heuristic tests passed.");
