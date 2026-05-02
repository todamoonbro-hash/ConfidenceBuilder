export type SkillFocus =
  | "breathing"
  | "vocal_warmup"
  | "articulation"
  | "read_aloud"
  | "impromptu"
  | "listening"
  | "executive_communication"
  | "media"
  | "exposure_drill"
  | "reflection";

export type CurriculumStep = {
  skill: SkillFocus;
  reason: string;
  durationMinutes: number;
  reps: number;
  edgeOfCompetence: boolean;
};

export type DailyPlanInput = {
  focusAreas: string[];
  durationMinutes: number;
  recentScoresByDimension?: Record<string, number[]>;
  weakestDimension?: string;
  upcomingRealEvent?: { kind: string; daysUntil: number } | null;
  streakDays?: number;
};

export type DailyPlan = {
  steps: CurriculumStep[];
  durationMinutes: number;
  rationale: string;
  edgeFocus: string;
};

const SKILL_DURATIONS: Record<SkillFocus, number> = {
  breathing: 2,
  vocal_warmup: 3,
  articulation: 3,
  read_aloud: 4,
  impromptu: 4,
  listening: 4,
  executive_communication: 4,
  media: 4,
  exposure_drill: 5,
  reflection: 2
};

const VALID_SKILLS: SkillFocus[] = [
  "breathing",
  "vocal_warmup",
  "articulation",
  "read_aloud",
  "impromptu",
  "listening",
  "executive_communication",
  "media",
  "exposure_drill",
  "reflection"
];

const DIMENSION_TO_SKILL: Record<string, SkillFocus> = {
  confidence: "impromptu",
  clarity: "articulation",
  fluency: "read_aloud",
  coherence: "executive_communication",
  persuasion: "executive_communication",
  presence: "executive_communication",
  pacing: "read_aloud",
  articulation: "articulation",
  listening: "listening",
  storytelling: "impromptu",
  composure: "media"
};

function mapDimensionToSkill(dimension: string | undefined): SkillFocus | null {
  if (!dimension) return null;
  const key = dimension.toLowerCase();
  if (DIMENSION_TO_SKILL[key]) return DIMENSION_TO_SKILL[key];
  if ((VALID_SKILLS as string[]).includes(key)) return key as SkillFocus;
  return null;
}

export function detectPlateau(scores: number[]): boolean {
  if (!Array.isArray(scores) || scores.length < 5) return false;
  const recent = scores.slice(-5);
  const mean = recent.reduce((acc, value) => acc + value, 0) / recent.length;
  return recent.every((score) => Math.abs(score - mean) <= 5);
}

export function generateDailyPlan(input: DailyPlanInput): DailyPlan {
  const totalBudget = Math.max(8, Math.floor(input.durationMinutes ?? 0));
  const focusAreas = Array.isArray(input.focusAreas) ? input.focusAreas : [];
  const streakDays = input.streakDays ?? 0;
  const upcomingEvent = input.upcomingRealEvent ?? null;

  const edgeSkill: SkillFocus =
    mapDimensionToSkill(input.weakestDimension) ??
    mapDimensionToSkill(focusAreas[0]) ??
    "impromptu";
  const edgeFocusName = input.weakestDimension ?? focusAreas[0] ?? "impromptu";

  const edgeScores = input.recentScoresByDimension?.[input.weakestDimension ?? ""] ?? [];
  const plateau = detectPlateau(edgeScores);

  const steps: CurriculumStep[] = [];

  steps.push({
    skill: "breathing",
    reason: "Anchor the nervous system before any vocal work.",
    durationMinutes: SKILL_DURATIONS.breathing,
    reps: 1,
    edgeOfCompetence: false
  });

  steps.push({
    skill: "vocal_warmup",
    reason: "Open the voice and articulators so practice transfers to real speech.",
    durationMinutes: SKILL_DURATIONS.vocal_warmup,
    reps: 1,
    edgeOfCompetence: false
  });

  const eventIsImminent = upcomingEvent && upcomingEvent.daysUntil <= 7 && upcomingEvent.daysUntil >= 0;
  if (eventIsImminent && upcomingEvent) {
    steps.push({
      skill: "reflection",
      reason: `Tomorrow: ${upcomingEvent.kind}. Practice the opening line you'll actually use.`,
      durationMinutes: SKILL_DURATIONS.reflection,
      reps: 1,
      edgeOfCompetence: false
    });
  }

  const edgeReps = plateau ? 12 : 9;
  steps.push({
    skill: edgeSkill,
    reason: plateau
      ? `Plateau on ${edgeFocusName} — pushing reps past comfort to break through.`
      : `Working at the edge of competence on ${edgeFocusName}.`,
    durationMinutes: SKILL_DURATIONS[edgeSkill] + 2,
    reps: edgeReps,
    edgeOfCompetence: true
  });

  if (eventIsImminent) {
    steps.push({
      skill: "exposure_drill",
      reason: "Real-event simulation forces transfer of skill under pressure.",
      durationMinutes: SKILL_DURATIONS.exposure_drill,
      reps: 2,
      edgeOfCompetence: false
    });
  }

  const supportPool: SkillFocus[] = [];
  if (edgeSkill !== "read_aloud") supportPool.push("read_aloud");
  if (edgeSkill !== "articulation") supportPool.push("articulation");
  if (edgeSkill !== "listening") supportPool.push("listening");
  if (edgeSkill !== "impromptu") supportPool.push("impromptu");

  const seenSkills = new Set(steps.map((step) => step.skill));
  for (const candidate of supportPool) {
    if (steps.length >= 8) break;
    if (seenSkills.has(candidate)) continue;
    steps.push({
      skill: candidate,
      reason: `Cross-train ${candidate.replace(/_/g, " ")} to reinforce the edge focus.`,
      durationMinutes: SKILL_DURATIONS[candidate],
      reps: 3,
      edgeOfCompetence: false
    });
    seenSkills.add(candidate);
  }

  while (steps.length < 4) {
    steps.push({
      skill: "reflection",
      reason: "Brief reflection cements what stuck and what to attack next session.",
      durationMinutes: SKILL_DURATIONS.reflection,
      reps: 1,
      edgeOfCompetence: false
    });
  }

  let runningTotal = 0;
  const clipped: CurriculumStep[] = [];
  for (const step of steps) {
    if (runningTotal >= totalBudget) break;
    const remaining = totalBudget - runningTotal;
    if (step.durationMinutes <= remaining) {
      clipped.push(step);
      runningTotal += step.durationMinutes;
    } else {
      clipped.push({ ...step, durationMinutes: remaining });
      runningTotal += remaining;
      break;
    }
  }

  while (clipped.length < 4) {
    clipped.push({
      skill: "reflection",
      reason: "Brief reflection to close the loop.",
      durationMinutes: 0,
      reps: 1,
      edgeOfCompetence: false
    });
  }

  const finalSteps = clipped.slice(0, 8);

  let rationale = `Today's plan targets ${edgeFocusName} at the edge of competence`;
  if (plateau && streakDays >= 7) {
    rationale += ` — plateau detected, moving to harder prompts`;
  } else if (plateau) {
    rationale += ` — plateau detected, increasing reps`;
  }
  if (eventIsImminent && upcomingEvent) {
    rationale += `, with exposure work tied to ${upcomingEvent.kind} in ${upcomingEvent.daysUntil} day(s)`;
  }
  rationale += ".";

  return {
    steps: finalSteps,
    durationMinutes: finalSteps.reduce((acc, step) => acc + step.durationMinutes, 0),
    rationale,
    edgeFocus: edgeFocusName
  };
}
