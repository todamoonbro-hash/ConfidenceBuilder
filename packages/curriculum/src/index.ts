export interface DailyPlanInput {
  weakestSkills: string[];
  streakDays: number;
}

export function generateDailyPlan(input: DailyPlanInput): string[] {
  const baseline = ["articulation", "read_aloud", "impromptu"];
  const targeted = input.weakestSkills.slice(0, 2);

  return [...new Set([...baseline, ...targeted, "exposure_drill"])];
}
