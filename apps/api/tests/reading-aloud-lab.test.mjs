import assert from "node:assert/strict";
import {
  compareTranscriptToSource,
  evaluateReadAloudAttempt,
  findReadingPassage,
  listReadingPassages
} from "../dist/services/reading-aloud-lab-service.js";

const passages = listReadingPassages({ mode: "guided_reading" });
assert.equal(passages.length > 0, true);

const passage = findReadingPassage("read_guided_001");
assert.equal(Boolean(passage), true);
if (!passage) {
  throw new Error("Expected passage not found");
}

const comparison = compareTranscriptToSource(
  "the team reduced processing delays and improved response quality",
  "the team reduced processing delay and and improved quality"
);

assert.equal(comparison.skippedWords.includes("delays"), true);
assert.equal(comparison.repeatedWords.includes("and"), true);
assert.equal(comparison.substitutions.length > 0, true);

const evaluation = evaluateReadAloudAttempt({
  passage,
  transcript: "Today we completed the first milestone and improved response quality with clear action steps.",
  durationSeconds: 35
});

assert.equal(evaluation.total > 0, true);
assert.equal(evaluation.awardedXp >= 12, true);
assert.equal(typeof evaluation.feedback.fluency, "string");

console.log("Reading aloud lab tests passed.");
