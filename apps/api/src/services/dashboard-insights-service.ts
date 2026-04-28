import type { DatabaseSnapshot, Score, SkillBranch } from "../db/types";

type TrendPoint = { label: string; value: number };

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreForUser(db: DatabaseSnapshot, userId: string): Score[] {
  const sessionIds = new Set(db.trainingSessions.filter((session) => session.userId === userId).map((session) => session.id));
  const attempts = db.attempts
    .filter((attempt) => sessionIds.has(attempt.sessionId))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const attemptIds = new Set(attempts.map((attempt) => attempt.id));
  return db.scores.filter((score) => attemptIds.has(score.attemptId));
}

function trendFromScores(scores: Score[], key: keyof Score): TrendPoint[] {
  return scores.slice(-8).map((score, index) => ({
    label: `#${index + 1}`,
    value: Number(score[key] ?? 0)
  }));
}

const areaMap: Array<{ key: keyof Score; label: string; skill: SkillBranch }> = [
  { key: "confidence", label: "confidence", skill: "confidence" },
  { key: "clarity", label: "clarity", skill: "confidence" },
  { key: "articulation", label: "articulation", skill: "articulation" },
  { key: "readingFluency", label: "reading fluency", skill: "reading" },
  { key: "concision", label: "concision", skill: "executive" },
  { key: "executivePresence", label: "executive presence", skill: "executive" },
  { key: "mediaControl", label: "media score", skill: "media" },
  { key: "listeningAccuracy", label: "listening score", skill: "listening" }
];

function growth(series: TrendPoint[]) {
  if (series.length < 2) return 0;
  return series[series.length - 1].value - series[0].value;
}

export function buildDashboardInsights(db: DatabaseSnapshot, userId: string) {
  const scores = scoreForUser(db, userId);
  const progression = db.gameProgressions.find((item) => item.userId === userId);
  const completedSessions = db.trainingSessions.filter((session) => session.userId === userId && session.status === "completed").length;
  const xpTrend = scores.slice(-8).map((score, index) => ({ label: `#${index + 1}`, value: score.total * 2 }));

  const areaAverages = areaMap.map((area) => ({
    ...area,
    avg: average(scores.map((score) => Number(score[area.key] ?? 0)))
  }));
  const strongest = [...areaAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakest = [...areaAverages].sort((a, b) => a.avg - b.avg)[0];

  const trends = {
    confidence: trendFromScores(scores, "confidence"),
    clarity: trendFromScores(scores, "clarity"),
    articulation: trendFromScores(scores, "articulation"),
    readingFluency: trendFromScores(scores, "readingFluency"),
    concision: trendFromScores(scores, "concision"),
    executivePresence: trendFromScores(scores, "executivePresence"),
    mediaScore: trendFromScores(scores, "mediaControl"),
    listeningScore: trendFromScores(scores, "listeningAccuracy"),
    xp: xpTrend
  };

  const recommendedExercise = db.exercises.find((exercise) => exercise.tags.includes(weakest?.skill ?? "confidence"));
  const activeQuestProgress = db.userQuestProgress.find((progress) => progress.userId === userId && progress.status === "active");
  const activeQuest = activeQuestProgress ? db.quests.find((quest) => quest.id === activeQuestProgress.questId) : undefined;
  const nextQuestRecommendation =
    db.quests.find((quest) => !db.userQuestProgress.some((progress) => progress.userId === userId && progress.questId === quest.id)) ?? db.quests[0];
  const nextBossChallengeRecommendation = db.weeklyBossChallenges[0];

  const weeklyReview = {
    whatImproved:
      growth(trends.clarity) >= 0
        ? `Clarity trend improved by ${growth(trends.clarity)} points over recent sessions.`
        : `Clarity dipped by ${Math.abs(growth(trends.clarity))} points and needs tighter response framing.`,
    stillNeedsWork: `Weakest area is ${weakest?.label ?? "confidence"} (${weakest?.avg ?? 0}/100).`,
    oneFocusForNextWeek: `Run one daily drill focused on ${weakest?.label ?? "core communication"} with explicit structure.`,
    nextQuestRecommendation: nextQuestRecommendation?.title ?? "Continue active quest",
    nextBossChallengeRecommendation: nextBossChallengeRecommendation?.title ?? "No boss challenge available yet"
  };

  return {
    trends,
    sessionStreak: progression?.streakDays ?? 0,
    completedSessions,
    strongestArea: strongest?.label ?? "n/a",
    weakestArea: weakest?.label ?? "n/a",
    nextRecommendedDrill: recommendedExercise
      ? {
          id: recommendedExercise.id,
          title: recommendedExercise.title,
          drillType: recommendedExercise.drillType
        }
      : null,
    levelProgress: {
      level: progression?.level ?? 1,
      levelTitle: progression?.levelTitle ?? "Rookie Speaker",
      overallXp: progression?.overallXp ?? 0,
      nextLevelXp: Math.floor(((progression?.overallXp ?? 0) / 120) + 1) * 120
    },
    milestone: {
      nextMilestone: progression?.nextMilestone ?? "Complete more sessions to unlock milestones.",
      nextSkillFocus: progression?.nextSkillFocus ?? "confidence",
      unlockedFeatures: progression?.unlockedFeatures ?? [],
      lockedFeatures: progression?.lockedFeatures ?? []
    },
    badgeProgress: {
      unlocked: db.userBadges.filter((badge) => badge.userId === userId).length,
      total: db.badges.length
    },
    questProgress: activeQuest
      ? {
          title: activeQuest.title,
          completedSteps: activeQuestProgress?.completedStepIds.length ?? 0,
          totalSteps: activeQuest.steps.length
        }
      : null,
    weeklyReview
  };
}
