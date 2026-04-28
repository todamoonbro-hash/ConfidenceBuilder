import assert from "node:assert/strict";

import {
  createScenarioDefinition,
  duplicateScenarioDefinition,
  listPublishedScenarioCards,
  setScenarioStatus,
  validateScenario
} from "../dist/services/scenario-studio-service.js";

const validationErrors = validateScenario({ title: "" });
assert.equal(validationErrors.length > 0, true);

const created = createScenarioDefinition({
  title: "Admin authored scenario",
  module: "networking",
  category: "Introductions",
  difficulty: "moderate",
  scenarioBrief: "Pitch yourself to a senior operator.",
  userRole: "Founder",
  aiPersonaRole: "Operator",
  aiPersonaDescription: "Fast-paced operator",
  aiPersonaBehaviour: "Concise and skeptical",
  openingAiLine: "Give me your ask quickly.",
  likelyFollowUpQuestions: ["Why now?"],
  resistanceLevel: "medium",
  successCriteria: ["Lead with answer"],
  scoringDimensions: [
    {
      name: "Clarity",
      description: "clear",
      anchors: { score0: "0", score25: "25", score50: "50", score75: "75", score100: "100" },
      critical: true
    }
  ],
  feedbackRules: ["direct"],
  coachingFramework: "BLUF",
  estimatedDurationMinutes: 10,
  tags: ["admin"],
  unlockRequirements: ["level >= 2"],
  xpReward: 100,
  badgeEligibility: [],
  passFailThreshold: 70,
  personaBuilder: {
    personaName: "Operator",
    tone: "direct",
    mood: "neutral",
    expertiseLevel: "high",
    patienceLevel: "low",
    pushbackLevel: "high",
    commonObjections: ["too vague"],
    whatPersuadesPersona: ["evidence"],
    whatAnnoysPersona: ["long setup"],
    escalationBehaviour: "ask harder"
  },
  active: true,
  published: false,
  archived: false
});

assert.equal(created.source, "admin");
const published = setScenarioStatus(created.id, "publish");
assert.equal(published?.published, true);
assert.equal(listPublishedScenarioCards("networking").some((item) => item.id === created.id), true);
assert.equal(duplicateScenarioDefinition(created.id)?.title.includes("Copy"), true);

console.log("Scenario studio tests passed.");
