import type { PracticeMode, SalesScenario } from "./sales-influence-data-service";

export type SalesDimensionScore = {
  score: number;
  whatWorked: string;
  whatFailed: string;
  improvement: string;
  repeatDrill: string;
};

export type SalesSessionReport = {
  overallScore: number;
  xpEarned: number;
  levelProgressDelta: number;
  topStrengths: string[];
  topWeaknesses: string[];
  transcript: string;
  bestLine: string;
  weakestLine: string;
  missedOpportunities: string[];
  suggestedStrongerVersion: string;
  frameworkComplianceScore: number;
  objectionsHandledWell: string[];
  objectionsMissed: string[];
  recommendedNextDrill: string;
  dimensions: Record<string, SalesDimensionScore>;
};

const DIMENSIONS = [
  "clarity", "openingStrength", "problemFraming", "discoveryQuality", "listeningResponsiveness", "commercialAcumen", "objectionHandling", "conciseness", "confidence", "toneWarmth", "persuasiveness", "evidenceProofPoints", "structure", "callControl", "closingNextStep", "fillerWords", "pace", "energy", "specificity", "adaptability"
] as const;

export function buildSalesSessionReport(input: {
  scenario: SalesScenario;
  frameworkId: string;
  mode: PracticeMode;
  transcript: string;
  turns: Array<{ role: "persona" | "user"; text: string }>;
}): SalesSessionReport {
  const words = input.transcript.trim().split(/\s+/).filter(Boolean);
  const fillerCount = words.filter((word) => ["um", "uh", "like", "basically"].includes(word.toLowerCase())).length;
  const base = 62 + Math.min(20, Math.floor(words.length / 12));
  const modePenalty = input.mode === "elite" ? -6 : input.mode === "pressure" ? -3 : 0;
  const rubricBoost = input.scenario.scoringRubric.length;
  const overallScore = Math.max(42, Math.min(97, base + rubricBoost + modePenalty - Math.min(8, fillerCount)));
  const frameworkComplianceScore = Math.max(40, Math.min(98, overallScore + (input.frameworkId === input.scenario.suggestedFramework ? 6 : 0) - 4));

  const dimensionScores = Object.fromEntries(
    DIMENSIONS.map((dimension, index) => {
      const score = Math.max(35, Math.min(98, overallScore + ((index % 5) - 2) * 3 - (dimension === "fillerWords" ? fillerCount : 0)));
      return [
        dimension,
        {
          score,
          whatWorked: `You demonstrated ${dimension} with clear intent in key moments.`,
          whatFailed: `Consistency in ${dimension} dropped during pressure questions.`,
          improvement: `For the next attempt, make one explicit ${dimension} checkpoint every 20-30 seconds.`,
          repeatDrill: `Repeat ${input.scenario.title} in ${input.mode} mode focusing on ${dimension}.`
        }
      ];
    })
  ) as Record<string, SalesDimensionScore>;

  const userLines = input.turns.filter((turn) => turn.role === "user").map((turn) => turn.text).filter(Boolean);
  const bestLine = userLines.reduce((best, current) => (current.length > best.length ? current : best), userLines[0] ?? "");
  const weakestLine = userLines.reduce((worst, current) => (current.length < worst.length ? current : worst), userLines[0] ?? "");

  const ranked = Object.entries(dimensionScores).sort((a, b) => b[1].score - a[1].score);
  const topStrengths = ranked.slice(0, 3).map(([key]) => key);
  const topWeaknesses = ranked.slice(-3).map(([key]) => key);

  const xpEarned = Math.round(input.scenario.xpReward * (input.mode === "pressure" ? 1.2 : input.mode === "elite" ? 1.35 : 1));

  return {
    overallScore,
    xpEarned,
    levelProgressDelta: Math.max(8, Math.floor(xpEarned / 8)),
    topStrengths,
    topWeaknesses,
    transcript: input.transcript,
    bestLine,
    weakestLine,
    missedOpportunities: ["Quantify business impact earlier", "Confirm decision process explicitly", "End with a concrete next-step commitment"],
    suggestedStrongerVersion: "Based on the metrics we discussed, I recommend a 30-day pilot with clear ROI gates and an executive review on day 21.",
    frameworkComplianceScore,
    objectionsHandledWell: ["Budget pressure", "Switching risk"],
    objectionsMissed: ["Implementation ownership", "Timeline urgency"],
    recommendedNextDrill: input.scenario.title,
    dimensions: dimensionScores
  };
}
