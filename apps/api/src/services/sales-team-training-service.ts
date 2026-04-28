import { SALES_CERTIFICATIONS, SALES_SCENARIOS } from "./sales-influence-data-service";

export function getTeamTrainingOverview() {
  return {
    featureStatus: "placeholder_ready_for_multi_user_auth",
    cards: {
      completionPercent: 68,
      averageScore: 74,
      topPerformer: "A. Patel",
      mostImproved: "R. Chen",
      weakestSkill: "objectionHandling",
      certificationReadiness: 62
    },
    leaderboard: [
      { name: "A. Patel", score: 88 },
      { name: "R. Chen", score: 83 },
      { name: "J. Morgan", score: 79 }
    ],
    skillHeatmap: [
      { skill: "clarity", average: 80 },
      { skill: "objectionHandling", average: 67 },
      { skill: "commercialAcumen", average: 72 },
      { skill: "closingNextStep", average: 70 }
    ],
    completionRateByScenario: SALES_SCENARIOS.slice(0, 6).map((scenario, idx) => ({ scenarioId: scenario.id, title: scenario.title, completionRate: 55 + idx * 4 })),
    commonWeakness: "callControl"
  };
}

export function getCertificationTracks() {
  return SALES_CERTIFICATIONS;
}
