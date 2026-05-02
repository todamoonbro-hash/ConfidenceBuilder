import type { DatabaseSnapshot, DifficultyTier, DrillType, Score } from "../db/types";

export const UNIFIED_SKILL_TAXONOMY = [
  "clarity",
  "conciseness",
  "structure",
  "confidence",
  "vocal_energy",
  "pace",
  "filler_words",
  "articulation",
  "storytelling",
  "executive_presence",
  "persuasion",
  "listening",
  "objection_handling",
  "emotional_control",
  "eye_contact_body_language",
  "reading_fluency",
  "improvisation",
  "commercial_acumen",
  "interview_readiness",
  "media_control",
  "negotiation",
  "rapport"
] as const;

export type UnifiedSkill = (typeof UNIFIED_SKILL_TAXONOMY)[number];

type SkillTrend = "improving" | "declining" | "stable";

type ModuleKey =
  | "public_speaking"
  | "articulation"
  | "reading_aloud"
  | "media_training"
  | "sales"
  | "interviews"
  | "executive_presence"
  | "difficult_conversations"
  | "networking"
  | "listening";

const LEVELS = ["Foundation", "Controlled Practice", "Realistic Practice", "Pressure Practice", "Elite Performance"] as const;

const MODULE_LABELS: Record<ModuleKey, string> = {
  public_speaking: "Public Speaking",
  articulation: "Articulation",
  reading_aloud: "Reading Aloud",
  media_training: "Media Training",
  sales: "Sales & Influence",
  interviews: "Interview Prep",
  executive_presence: "Executive Presence",
  difficult_conversations: "Difficult Conversations",
  networking: "Networking",
  listening: "Listening Response"
};

const DRILL_START_PATH: Record<ModuleKey, string> = {
  public_speaking: "/session",
  articulation: "/modules",
  reading_aloud: "/modules",
  media_training: "/modules",
  sales: "/sales-influence",
  interviews: "/interview-prep",
  executive_presence: "/executive-presence",
  difficult_conversations: "/difficult-conversations",
  networking: "/networking",
  listening: "/modules"
};

function toModule(drillType: DrillType): ModuleKey {
  if (drillType === "articulation") return "articulation";
  if (drillType === "read_aloud") return "reading_aloud";
  if (drillType === "listening_response") return "listening";
  if (drillType === "interview") return "interviews";
  if (drillType === "executive_communication") return "executive_presence";
  if (drillType === "impromptu") return "public_speaking";
  return "public_speaking";
}

function average(values: number[]): number {
  // Skip NOT_MEASURED (-1) sentinels so honestly-absent dimensions don't poison aggregates.
  const valid = values.filter((value) => value !== NOT_MEASURED && Number.isFinite(value));
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function isNotMeasuredSkill(skill: UnifiedSkill): boolean {
  return NOT_MEASURED_DIMENSIONS.includes(skill);
}

// Sentinel value for dimensions we cannot honestly measure from text alone.
// Consumers / UI must check NOT_MEASURED_DIMENSIONS before displaying these as scores.
export const NOT_MEASURED = -1 as const;

// Dimensions that REQUIRE camera or audio prosody analysis (which we don't have on the server today).
// We refuse to fabricate these from text-only signals; they read as "not measured" in the UI.
export const NOT_MEASURED_DIMENSIONS: readonly UnifiedSkill[] = [
  "vocal_energy",
  "pace",
  "eye_contact_body_language"
] as const;

function scoreToSkillVector(score: Score): Record<UnifiedSkill, number> {
  return {
    clarity: score.clarity,
    conciseness: score.concision,
    structure: Math.round((score.presentation + score.executivePresence) / 2),
    confidence: score.confidence,
    // vocal_energy / pace require audio prosody (pitch contour, rms energy, articulation rate) which the
    // text-only scoring pipeline cannot produce. We report NOT_MEASURED instead of inventing a number.
    vocal_energy: NOT_MEASURED,
    pace: NOT_MEASURED,
    filler_words: Math.max(0, 100 - score.concision),
    articulation: score.articulation,
    storytelling: score.storytelling,
    executive_presence: score.executivePresence,
    persuasion: score.persuasion,
    listening: score.listening ?? score.listeningAccuracy,
    objection_handling: Math.round((score.persuasion + score.executivePresence) / 2),
    emotional_control: Math.round((score.executivePresence + score.confidence) / 2),
    // eye_contact / body_language require camera. Honest absence beats a synthetic "executivePresence + confidence / 2" number.
    eye_contact_body_language: NOT_MEASURED,
    reading_fluency: score.readingFluency,
    improvisation: score.impromptu,
    commercial_acumen: Math.round((score.persuasion + score.mediaControl) / 2),
    interview_readiness: Math.round((score.impromptu + score.executivePresence) / 2),
    media_control: score.mediaControl,
    negotiation: Math.round((score.persuasion + score.listeningAccuracy) / 2),
    rapport: Math.round((score.listeningAccuracy + score.confidence) / 2)
  };
}

function trend(previous: number, recent: number): SkillTrend {
  if (recent - previous >= 4) return "improving";
  if (previous - recent >= 4) return "declining";
  return "stable";
}

export function buildAdaptiveCoachOverview(db: DatabaseSnapshot, userId: string) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const attempts = db.attempts.filter((attempt) => {
    const session = db.trainingSessions.find((item) => item.id === attempt.sessionId);
    return session?.userId === userId;
  });

  const attemptIds = new Set(attempts.map((attempt) => attempt.id));
  const scores = db.scores.filter((score) => attemptIds.has(score.attemptId));

  const latestScores = scores.slice(-24);
  const recent = latestScores.slice(-10);
  const baseline = latestScores.slice(0, Math.max(3, latestScores.length - recent.length));

  const skillScores = Object.fromEntries(
    UNIFIED_SKILL_TAXONOMY.map((skill) => {
      if (isNotMeasuredSkill(skill)) return [skill, NOT_MEASURED];
      const values = latestScores.map((item) => scoreToSkillVector(item)[skill]);
      return [skill, average(values)];
    })
  ) as Record<UnifiedSkill, number>;

  // Weaknesses are measured-only; we never label an unmeasured dimension a "weakness".
  const weaknessTags = UNIFIED_SKILL_TAXONOMY
    .filter((skill) => !isNotMeasuredSkill(skill) && skillScores[skill] < 70)
    .sort((left, right) => skillScores[left] - skillScores[right])
    .slice(0, 6);

  const trends = Object.fromEntries(
    UNIFIED_SKILL_TAXONOMY.map((skill) => {
      const baselineAvg = average(baseline.map((item) => scoreToSkillVector(item)[skill]));
      const recentAvg = average(recent.map((item) => scoreToSkillVector(item)[skill]));
      return [skill, trend(baselineAvg, recentAvg)];
    })
  ) as Record<UnifiedSkill, SkillTrend>;

  const improvingSkills = UNIFIED_SKILL_TAXONOMY.filter((skill) => trends[skill] === "improving").slice(0, 4);
  const decliningSkills = UNIFIED_SKILL_TAXONOMY.filter((skill) => trends[skill] === "declining").slice(0, 4);

  const moduleMinutes: Record<ModuleKey, number> = {
    public_speaking: 0,
    articulation: 0,
    reading_aloud: 0,
    media_training: 0,
    sales: 0,
    interviews: 0,
    executive_presence: 0,
    difficult_conversations: 0,
    networking: 0,
    listening: 0
  };

  attempts.forEach((attempt) => {
    const exercise = db.exercises.find((item) => item.id === attempt.exerciseId);
    if (!exercise) return;
    moduleMinutes[toModule(exercise.drillType)] += Math.max(1, Math.round(attempt.durationSeconds / 60));
  });

  const practicedModules = Object.entries(moduleMinutes).filter(([, minutes]) => minutes > 0) as Array<[ModuleKey, number]>;
  practicedModules.sort((a, b) => a[1] - b[1]);

  const avoidedModules = practicedModules.filter(([, minutes]) => minutes <= 5).map(([module]) => module).slice(0, 3);
  const overPractisedModules = practicedModules.filter(([, minutes]) => minutes >= 25).map(([module]) => module).slice(0, 3);

  const confidenceGap = Math.max(0, skillScores.confidence - skillScores.structure);
  const pressureModeGap = Math.max(0, skillScores.clarity - skillScores.emotional_control);
  const deliveryScore = average([skillScores.vocal_energy, skillScores.pace, skillScores.articulation, skillScores.confidence]);
  const contentScore = average([skillScores.structure, skillScores.conciseness, skillScores.storytelling, skillScores.persuasion]);
  const deliveryVsContentGap = Math.abs(deliveryScore - contentScore);

  const recommendedDrills = [
    {
      id: "quick_win",
      title: "Lead with the answer first",
      drillType: "quick_win",
      reason: `Conciseness (${skillScores.conciseness}) is dragging down clarity under pressure.`,
      expectedBenefit: "Cuts setup language and filler in first 10 seconds.",
      estimatedDurationMinutes: 8,
      xpReward: 40,
      linkedModule: "interviews",
      startPath: DRILL_START_PATH.interviews,
      coachLine: "You are using too many setup words before answering."
    },
    {
      id: "core_improvement",
      title: "Structure under pressure ladder",
      drillType: "core_improvement",
      reason: `Structure trend is ${trends.structure} and confidence-to-structure gap is ${confidenceGap}.`,
      expectedBenefit: "Builds reliable answer architecture before delivery polish.",
      estimatedDurationMinutes: 18,
      xpReward: 90,
      linkedModule: "executive_presence",
      startPath: DRILL_START_PATH.executive_presence,
      coachLine: "Your issue is not confidence, it is structure under pressure."
    },
    {
      id: "stretch",
      title: "Hostile stakeholder objection roleplay",
      drillType: "stretch",
      reason: `Objection handling (${skillScores.objection_handling}) and emotional control (${skillScores.emotional_control}) are below target.`,
      expectedBenefit: "Improves authority while keeping warmth when challenged.",
      estimatedDurationMinutes: 22,
      xpReward: 130,
      linkedModule: "difficult_conversations",
      startPath: DRILL_START_PATH.difficult_conversations,
      coachLine: "Repeat this drill three times before moving on."
    }
  ] as const;

  const weekAttempts = attempts.filter((attempt) => new Date(attempt.createdAt) >= weekAgo);
  const weekAttemptIds = new Set(weekAttempts.map((attempt) => attempt.id));
  const weekScores = scores.filter((score) => weekAttemptIds.has(score.attemptId));
  const progress = db.gameProgressions.find((item) => item.userId === userId);

  const strongestModule = practicedModules.slice().sort((a, b) => b[1] - a[1])[0]?.[0] ?? "public_speaking";
  const weakestModule = practicedModules[0]?.[0] ?? "public_speaking";

  const weeklyReview = {
    totalPracticeMinutes: weekAttempts.reduce((sum, item) => sum + Math.round(item.durationSeconds / 60), 0),
    sessionsCompleted: weekAttempts.length,
    xpEarned: progress?.overallXp ?? 0,
    skillGains: improvingSkills,
    strongestModule: MODULE_LABELS[strongestModule],
    weakestModule: MODULE_LABELS[weakestModule],
    bestPerformance: weekScores.slice().sort((a, b) => b.total - a.total)[0]?.total ?? 0,
    worstPerformance: weekScores.slice().sort((a, b) => a.total - b.total)[0]?.total ?? 0,
    recommendedFocus: weaknessTags[0] ?? "structure",
    reflectionPrompt: "What one behaviour, repeated daily, would most improve your weakest skill next week?"
  };

  const userSkillTree = UNIFIED_SKILL_TAXONOMY.map((skill) => {
    const score = skillScores[skill];
    const isMeasured = !isNotMeasuredSkill(skill) && score !== NOT_MEASURED;
    const levelIndex = isMeasured ? Math.min(LEVELS.length - 1, Math.max(0, Math.floor(score / 20))) : 0;
    const progressPercent = isMeasured ? Math.min(100, Math.max(0, score)) : 0;

    return {
      skill,
      measured: isMeasured,
      // For unmeasured skills, expose explicit nulls so the UI can render a clear "not measured this session"
      // affordance instead of a misleading 0% bar.
      currentLevel: isMeasured ? LEVELS[levelIndex] : null,
      progressPercent: isMeasured ? progressPercent : null,
      unlockedDrills: isMeasured ? levelIndex + 1 : 0,
      nextUnlock: isMeasured ? LEVELS[Math.min(LEVELS.length - 1, levelIndex + 1)] : null,
      notMeasuredReason: isMeasured
        ? null
        : "Requires audio prosody or camera input — not measured from text-only scoring."
    };
  });

  const todayTraining = {
    quickWin: recommendedDrills[0],
    core: recommendedDrills[1],
    stretch: recommendedDrills[2]
  };

  const coachingPlan = {
    coachVoice: "direct_practical_motivating",
    dailyInstruction: "Lead with the answer first, then add one proof point.",
    weeklyInstruction: "Your strongest area is warmth; now we need to sharpen authority.",
    focusOrder: ["structure", "conciseness", "emotional_control"],
    nextCheckIn: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  };

  return {
    generatedAt: now.toISOString(),
    taxonomy: UNIFIED_SKILL_TAXONOMY,
    skillScores,
    weaknessTags,
    weaknessMap: {
      lowestScoringSkills: weaknessTags,
      repeatedWeaknesses: weaknessTags.slice(0, 3),
      improvingSkills,
      decliningSkills,
      avoidedModules: avoidedModules.map((module) => MODULE_LABELS[module]),
      overPractisedModules: overPractisedModules.map((module) => MODULE_LABELS[module]),
      confidenceGap,
      pressureModeGap,
      deliveryVsContentGap
    },
    todayTraining,
    recommendedDrills,
    weeklyReviews: weeklyReview,
    userSkillTree,
    coachingPlan,
    progress: {
      level: progress?.level ?? 1,
      currentDifficulty: (progress?.currentDifficulty ?? "Easy") as DifficultyTier,
      overallXp: progress?.overallXp ?? 0
    }
  };
}
