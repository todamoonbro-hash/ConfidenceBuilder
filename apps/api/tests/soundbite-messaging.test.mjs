import assert from "node:assert/strict";
import { scoreSoundbitePractice, transformToSoundbites } from "../dist/services/soundbite-messaging-service.js";

const transformed = transformToSoundbites({
  answer:
    "I think maybe we should leverage cross-functional synergy to operationalize this initiative quickly. What matters most is safety."
});

assert.equal(transformed.coreMessage.length > 0, true);
assert.equal(transformed.soundbites.tenSecond.length > 0, true);
assert.equal(Array.isArray(transformed.flags.jargon), true);

const scored = scoreSoundbitePractice({
  originalAnswer: "This is a very long answer with many details and context and multiple branches and examples for everyone.",
  practiceTranscript: "What matters most is customer safety and fast action.",
  targetSoundbite: transformed.soundbites.tenSecond,
  selfRating: 4
});

assert.equal(scored.scores.brevity > 0, true);
assert.equal(scored.scores.clarity > 0, true);
assert.equal(scored.scores.memorability > 0, true);
assert.equal(scored.xpAward.totalXp > 0, true);

console.log("Soundbite messaging tests passed.");
