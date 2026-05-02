import assert from "node:assert/strict";

import { generateAiFeedback } from "../dist/services/feedback-engine-service.js";

const feedback = await generateAiFeedback({
  transcript: "I recommend we approve this because it reduces risk and gives the team a clear next step.",
  exerciseType: "impromptu",
  userGoals: ["confidence"],
  sessionLevel: "foundation",
  skillBranch: "confidence",
  difficultyLevel: "Easy",
  modelPreference: {
    task: "feedback",
    provider: "deepseek",
    model: "deepseek-chat",
    costMode: "lowest_cost",
    enabled: true,
    fallbackProvider: "mistral",
    fallbackModel: "mistral-small-latest"
  }
});

assert.equal(typeof feedback.whatWorked, "string");
assert.equal(typeof feedback.priorityFix, "string");
assert.ok(feedback.scores.clarity.value >= 0);
assert.ok(feedback.scores.clarity.value <= 100);

console.log("feedback low-balance fallback ok");
