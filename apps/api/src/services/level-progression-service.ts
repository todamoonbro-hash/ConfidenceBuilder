import type { GameProgress } from "../db/types";

export function calculateLevel(overallXp: number): number {
  return Math.floor(overallXp / 120) + 1;
}

export function updateStreak(lastActiveDate: string | undefined, today: string, currentStreak: number): number {
  if (!lastActiveDate) {
    return 1;
  }

  const lastDate = new Date(`${lastActiveDate}T00:00:00.000Z`);
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / dayMs);

  if (diffDays <= 0) {
    return currentStreak;
  }

  if (diffDays === 1) {
    return currentStreak + 1;
  }

  return 1;
}

export function applyXpToProgress(progress: GameProgress, xp: number, skillUpdates: GameProgress["skillXp"]): GameProgress {
  const updatedOverallXp = progress.overallXp + xp;

  const mergedSkills = {
    ...progress.skillXp,
    confidence: progress.skillXp.confidence + skillUpdates.confidence,
    articulation: progress.skillXp.articulation + skillUpdates.articulation,
    reading: progress.skillXp.reading + skillUpdates.reading,
    impromptu: progress.skillXp.impromptu + skillUpdates.impromptu,
    listening: progress.skillXp.listening + skillUpdates.listening,
    executive: progress.skillXp.executive + skillUpdates.executive,
    media: progress.skillXp.media + skillUpdates.media,
    presentation: progress.skillXp.presentation + skillUpdates.presentation,
    storytelling: progress.skillXp.storytelling + skillUpdates.storytelling,
    persuasion: progress.skillXp.persuasion + skillUpdates.persuasion
  };

  return {
    ...progress,
    overallXp: updatedOverallXp,
    level: calculateLevel(updatedOverallXp),
    skillXp: mergedSkills
  };
}
