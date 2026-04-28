import type { DatabaseSnapshot, GameProgress, SkillBranch } from "../db/types";

export const LEVEL_STAGES = [
  "Rookie Speaker",
  "Clear Communicator",
  "Confident Operator",
  "Articulate Performer",
  "Boardroom Speaker",
  "Media-Ready Spokesperson",
  "Persuasive Presenter",
  "High-Pressure Performer",
  "Keynote-Level Communicator",
  "Elite Speaker"
] as const;

const featureUnlocks: Array<{ minLevel: number; feature: string }> = [
  { minLevel: 1, feature: "Core daily sessions" },
  { minLevel: 2, feature: "Structured articulation scoring" },
  { minLevel: 3, feature: "Reading + listening labs" },
  { minLevel: 4, feature: "Advanced impromptu drills" },
  { minLevel: 5, feature: "Boardroom simulation modes" },
  { minLevel: 6, feature: "Media pressure simulations" },
  { minLevel: 7, feature: "Persuasion and presentation pathways" },
  { minLevel: 8, feature: "High-pressure challenge sequencing" },
  { minLevel: 9, feature: "Keynote readiness track" },
  { minLevel: 10, feature: "Elite mastery loops" }
];

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function skillLevelFromXp(xp: number) {
  return clamp(Math.floor(xp / 180) + 1, 1, 10);
}

export function computeStageProgression(db: DatabaseSnapshot, progress: GameProgress): GameProgress {
  const attemptsByUser = new Set(db.attempts.filter((attempt) => db.trainingSessions.some((session) => session.id === attempt.sessionId && session.userId === progress.userId)).map((attempt) => attempt.id));
  const userScores = db.scores.filter((score) => attemptsByUser.has(score.attemptId));
  const totalScores = userScores.map((score) => score.total);
  const avgScore = average(totalScores);
  const recent = totalScores.slice(-8);
  const weakAreaImprovement = recent.length >= 4 ? average(recent.slice(-4)) - average(recent.slice(0, 4)) : 0;
  const questCompletionCount = db.userQuestProgress.filter((item) => item.userId === progress.userId && item.status === "completed").length;
  const challengeCompletionCount = db.bossChallengeAttempts.filter((item) => item.userId === progress.userId && ["pass", "complete"].includes(item.outcome)).length;
  const skillXpValues = Object.values(progress.skillXp);
  const skillThresholdCount = skillXpValues.filter((xp) => xp >= 240).length;

  const stageScore =
    progress.overallXp * 0.006 +
    avgScore * 0.18 +
    progress.streakDays * 0.9 +
    clamp(weakAreaImprovement, -10, 20) * 0.6 +
    questCompletionCount * 6 +
    challengeCompletionCount * 7 +
    skillThresholdCount * 1.4;

  const thresholds = [0, 32, 52, 74, 98, 126, 158, 194, 236, 282];
  let level = 1;
  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    if (stageScore >= thresholds[index]) {
      level = index + 1;
      break;
    }
  }

  const nextLevel = clamp(level + 1, 1, 10);
  const nextMilestone =
    level >= 10
      ? "Elite Speaker mastery reached. Maintain consistency across all pressure scenarios."
      : `Reach level ${nextLevel} (${LEVEL_STAGES[nextLevel - 1]}) by improving weakest skills and maintaining streak consistency.`;

  const unlockedFeatures = featureUnlocks.filter((item) => level >= item.minLevel).map((item) => item.feature);
  const lockedFeatures = featureUnlocks.filter((item) => level < item.minLevel).map((item) => item.feature);

  const nextSkillFocus = (Object.entries(progress.skillXp).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "confidence") as SkillBranch;
  const skillLevels = Object.fromEntries(Object.entries(progress.skillXp).map(([skill, xp]) => [skill, skillLevelFromXp(xp)])) as Record<SkillBranch, number>;

  return {
    ...progress,
    level,
    levelTitle: LEVEL_STAGES[level - 1],
    nextMilestone,
    unlockedFeatures,
    lockedFeatures,
    nextSkillFocus,
    skillLevels
  };
}
