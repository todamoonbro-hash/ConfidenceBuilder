import assert from "node:assert/strict";
import { evaluateImpromptuAnswer, startImpromptuPrompt } from "../dist/services/impromptu-speaking-lab-service.js";

const generated = startImpromptuPrompt({ category: "board_question", timerSeconds: 90 });
assert.equal(generated.category, "board_question");
assert.equal(generated.timerSeconds, 90);
assert.equal(typeof generated.prompt, "string");

const first = evaluateImpromptuAnswer({
  prompt: generated.prompt,
  transcript: "Um we should maybe think about this and like decide later.",
  durationSeconds: 45,
  targetSeconds: 90
});

assert.equal(first.total > 0, true);
assert.equal(typeof first.retryInstruction, "string");

const retry = evaluateImpromptuAnswer({
  prompt: generated.prompt,
  transcript: "First, I recommend we stabilize delivery quality. Second, we will focus resources on one execution metric and report progress weekly. Finally, we will review results with the board in thirty days.",
  durationSeconds: 82,
  targetSeconds: 90,
  previousTranscript: "Um we should maybe think about this and like decide later."
});

assert.equal(retry.improvement?.delta >= 0, true);
assert.equal(retry.xpAward >= 14, true);

console.log("Impromptu speaking lab tests passed.");
