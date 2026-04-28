import type { DifficultyTier } from "../db/types";

const ORDER: DifficultyTier[] = ["Easy", "Moderate", "Challenging", "Pressure", "Performance", "Elite"];

export function adjustDifficulty(current: DifficultyTier, recentScores: number[]): DifficultyTier {
  if (recentScores.length === 0) {
    return current;
  }

  const average = recentScores.reduce((sum, value) => sum + value, 0) / recentScores.length;
  const index = ORDER.indexOf(current);

  if (average >= 80 && index < ORDER.length - 1) {
    return ORDER[index + 1];
  }

  if (average < 55 && index > 0) {
    return ORDER[index - 1];
  }

  return current;
}
