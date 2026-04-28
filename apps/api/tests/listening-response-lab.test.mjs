import assert from "node:assert/strict";
import { evaluateListeningResponse, startListeningDrill } from "../dist/services/listening-response-lab-service.js";

const drill = startListeningDrill({ drillType: "detect_tone_intent" });
assert.equal(drill.drillType, "detect_tone_intent");

const evaluation = evaluateListeningResponse({
  prompt: drill,
  transcript: "The speaker sounds skeptical about the timeline, so I would address credibility with concrete proof and milestones.",
  durationSeconds: 48
});

assert.equal(evaluation.total > 0, true);
assert.equal(evaluation.scores.toneRecognition >= 60, true);
assert.equal(evaluation.awardedXp >= 12, true);

console.log("Listening response lab tests passed.");
