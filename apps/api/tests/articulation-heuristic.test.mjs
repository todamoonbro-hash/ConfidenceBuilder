import assert from "node:assert/strict";
import { scoreArticulationHeuristic } from "../dist/services/articulation-heuristic-service.js";

const result = scoreArticulationHeuristic({
  transcript: "Think through three thoughtful themes this Thursday",
  examplePhrase: "Think through three thoughtful themes this Thursday",
  durationSeconds: 12,
  selfRating: 4
});

assert.equal(result.label.includes("heuristic"), true);
assert.equal(result.total > 0, true);
assert.equal(result.awardedXp > 0, true);
assert.equal(result.factors.transcriptCompleteness, 100);

const repeated = scoreArticulationHeuristic({
  transcript: "think think think this this",
  examplePhrase: "think this clearly",
  durationSeconds: 20,
  selfRating: 2
});

assert.equal(repeated.factors.repeatedWordRuns > 0, true);
assert.equal(repeated.factors.repeatedWordsScore < 100, true);

console.log("Articulation heuristic tests passed.");
