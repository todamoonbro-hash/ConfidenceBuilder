import { DIFFICULT_SCENARIOS } from "./difficult-conversations-data-service";
import { EXECUTIVE_SCENARIOS } from "./executive-presence-data-service";
import { NETWORKING_SCENARIOS } from "./networking-data-service";

export type ScenarioModule =
  | "public_speaking"
  | "articulation"
  | "reading_aloud"
  | "media_training"
  | "sales_influence"
  | "interview_prep"
  | "executive_presence"
  | "difficult_conversations"
  | "networking";

export interface RubricDimension {
  name: string;
  description: string;
  anchors: { score0: string; score25: string; score50: string; score75: string; score100: string };
  critical: boolean;
}

export interface PersonaBlueprint {
  personaName: string;
  tone: string;
  mood: string;
  expertiseLevel: string;
  patienceLevel: string;
  pushbackLevel: string;
  commonObjections: string[];
  whatPersuadesPersona: string[];
  whatAnnoysPersona: string[];
  escalationBehaviour: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  module: ScenarioModule;
  category: string;
  difficulty: "easy" | "moderate" | "hard" | "pressure";
  scenarioBrief: string;
  userRole: string;
  aiPersonaRole: string;
  aiPersonaDescription: string;
  aiPersonaBehaviour: string;
  openingAiLine: string;
  likelyFollowUpQuestions: string[];
  resistanceLevel: "low" | "medium" | "high";
  successCriteria: string[];
  scoringDimensions: RubricDimension[];
  feedbackRules: string[];
  coachingFramework: string;
  estimatedDurationMinutes: number;
  tags: string[];
  unlockRequirements: string[];
  xpReward: number;
  badgeEligibility: string[];
  passFailThreshold: number;
  personaBuilder: PersonaBlueprint;
  active: boolean;
  published: boolean;
  archived: boolean;
  source: "seed" | "admin";
  createdAt: string;
  updatedAt: string;
}

const store: ScenarioDefinition[] = [
  ...NETWORKING_SCENARIOS.map((item) => toSeed(item.id, item.title, "networking", item.subsection, item.xpReward)),
  ...DIFFICULT_SCENARIOS.map((item) => toSeed(item.id, item.title, "difficult_conversations", item.subsection, item.xpReward)),
  ...EXECUTIVE_SCENARIOS.map((item) => toSeed(item.id, item.title, "executive_presence", item.subsection, item.xpReward))
];

function toSeed(id: string, title: string, module: ScenarioModule, category: string, xpReward: number): ScenarioDefinition {
  const now = new Date().toISOString();
  return {
    id,
    title,
    module,
    category,
    difficulty: "moderate",
    scenarioBrief: `${title} scenario authored from existing seed module data.`,
    userRole: "professional",
    aiPersonaRole: "challenger",
    aiPersonaDescription: "Focused stakeholder evaluating clarity and confidence.",
    aiPersonaBehaviour: "Direct, practical, and pressure-aware.",
    openingAiLine: "Start when ready. Lead with the answer first.",
    likelyFollowUpQuestions: ["What is your recommendation?", "Why now?", "What is the risk?"],
    resistanceLevel: "medium",
    successCriteria: ["Lead with clear answer", "Give one proof point", "Close with next step"],
    scoringDimensions: [
      {
        name: "Clarity",
        description: "Is the answer easy to follow?",
        anchors: {
          score0: "Unclear and rambling",
          score25: "Partially clear",
          score50: "Understandable but loose",
          score75: "Clear with structure",
          score100: "Crisp and immediately clear"
        },
        critical: true
      }
    ],
    feedbackRules: ["Prioritize one behaviour fix", "Be direct and actionable"],
    coachingFramework: "BLUF",
    estimatedDurationMinutes: 12,
    tags: [module, "seed"],
    unlockRequirements: ["Complete onboarding"],
    xpReward,
    badgeEligibility: [],
    passFailThreshold: 70,
    personaBuilder: {
      personaName: "Stakeholder",
      tone: "direct",
      mood: "neutral",
      expertiseLevel: "high",
      patienceLevel: "medium",
      pushbackLevel: "medium",
      commonObjections: ["Too vague", "Not enough proof"],
      whatPersuadesPersona: ["Evidence", "Clear recommendation"],
      whatAnnoysPersona: ["Long setup", "Defensiveness"],
      escalationBehaviour: "Asks harder follow-up questions"
    },
    active: true,
    published: true,
    archived: false,
    source: "seed",
    createdAt: now,
    updatedAt: now
  };
}

export function validateScenario(input: Partial<ScenarioDefinition>): string[] {
  const required: Array<keyof ScenarioDefinition> = [
    "title",
    "module",
    "category",
    "difficulty",
    "scenarioBrief",
    "userRole",
    "aiPersonaRole",
    "aiPersonaDescription",
    "aiPersonaBehaviour",
    "openingAiLine",
    "coachingFramework"
  ];

  return required.filter((field) => !input[field]).map((field) => `${field}_required`);
}

export function listScenarioDefinitions(filters?: { module?: ScenarioModule; includeArchived?: boolean }) {
  return store.filter((item) => {
    if (!filters?.includeArchived && item.archived) return false;
    if (filters?.module && item.module !== filters.module) return false;
    return true;
  });
}

export function createScenarioDefinition(input: Omit<ScenarioDefinition, "id" | "source" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const scenario: ScenarioDefinition = {
    ...input,
    id: `admin_${store.length + 1}`,
    source: "admin",
    createdAt: now,
    updatedAt: now
  };

  store.push(scenario);
  return scenario;
}

export function updateScenarioDefinition(id: string, patch: Partial<ScenarioDefinition>) {
  const existing = store.find((item) => item.id === id);
  if (!existing) return undefined;
  Object.assign(existing, patch, { updatedAt: new Date().toISOString() });
  return existing;
}

export function runScenarioAdminTest(id: string) {
  const scenario = store.find((item) => item.id === id);
  if (!scenario) return undefined;

  return {
    previewAsLearner: {
      scenarioBrief: scenario.scenarioBrief,
      openingAiLine: scenario.openingAiLine,
      likelyFollowUpQuestions: scenario.likelyFollowUpQuestions.slice(0, 2)
    },
    samplePersonaReply: `${scenario.personaBuilder.personaName}: Give me your recommendation in one sentence first.`,
    sampleFeedbackReport: {
      passFailThreshold: scenario.passFailThreshold,
      dimensions: scenario.scoringDimensions.map((dimension) => ({ dimension: dimension.name, score: 72 })),
      coaching: "You need to lead with the answer first."
    }
  };
}

export function duplicateScenarioDefinition(id: string) {
  const source = store.find((item) => item.id === id);
  if (!source) return undefined;

  return createScenarioDefinition({
    ...source,
    title: `${source.title} (Copy)`,
    active: false,
    published: false,
    archived: false
  });
}

export function setScenarioStatus(id: string, action: "archive" | "publish" | "unpublish" | "activate" | "deactivate") {
  const scenario = store.find((item) => item.id === id);
  if (!scenario) return undefined;

  if (action === "archive") {
    scenario.archived = true;
    scenario.active = false;
    scenario.published = false;
  }
  if (action === "publish") {
    scenario.published = true;
    scenario.active = true;
    scenario.archived = false;
  }
  if (action === "unpublish") scenario.published = false;
  if (action === "activate") scenario.active = true;
  if (action === "deactivate") scenario.active = false;
  scenario.updatedAt = new Date().toISOString();

  return scenario;
}

export function listPublishedScenarioCards(module: ScenarioModule) {
  return listScenarioDefinitions({ module }).filter((item) => item.published && !item.archived);
}
