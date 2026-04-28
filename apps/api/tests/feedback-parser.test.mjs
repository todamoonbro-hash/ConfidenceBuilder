import assert from "node:assert/strict";
import { parseFeedbackResponse } from "../dist/services/feedback-engine-service.js";

const mockedAiResponse = JSON.stringify({
  whatWorked: "Your opening was direct and easy to follow.",
  whatWeakened: "You stacked too many ideas in the middle, which reduced clarity.",
  priorityFix: "Use a single headline sentence before details.",
  retryInstruction: "Retry in 45 seconds with headline, two supports, one close.",
  scores: {
    clarity: { value: 74, reason: "Clear opening but crowded middle." },
    confidence: { value: 78, reason: "Tone was steady and assertive." },
    concision: { value: 66, reason: "Some phrases were longer than needed." },
    articulation: { value: 72, reason: "Mostly crisp consonants." },
    readingFluency: { value: 69, reason: "Pacing dipped on long phrases." },
    executivePresence: { value: 75, reason: "Recommendation framing was strong." },
    mediaControl: { value: 70, reason: "Stayed composed under pressure framing." },
    listeningAccuracy: { value: 73, reason: "Addressed prompt requirements." },
    persuasion: { value: 71, reason: "Claim had evidence but weak close." },
    storytelling: { value: 63, reason: "Limited narrative flow." }
  }
});

const parsed = parseFeedbackResponse(mockedAiResponse);

assert.equal(parsed.whatWorked.includes("opening"), true);
assert.equal(parsed.scores.clarity.value, 74);
assert.equal(parsed.scores.storytelling.reason.length > 0, true);

const clamped = parseFeedbackResponse(
  JSON.stringify({
    ...JSON.parse(mockedAiResponse),
    scores: {
      ...JSON.parse(mockedAiResponse).scores,
      clarity: { value: 140, reason: "bad range" }
    }
  })
);

assert.equal(clamped.scores.clarity.value, 100);

console.log("Feedback parser tests passed.");
