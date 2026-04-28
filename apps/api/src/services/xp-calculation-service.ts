import type { DifficultyTier, SkillBranch, SkillXpMap } from "../db/types";

const BASE_XP_BY_DIFFICULTY: Record<DifficultyTier, number> = {
  Easy: 20,
  Moderate: 30,
  Challenging: 40,
  Pressure: 50,
  Performance: 60,
  Elite: 75
};

function emptySkillXpMap(): SkillXpMap {
  return {
    confidence: 0,
    articulation: 0,
    reading: 0,
    impromptu: 0,
    listening: 0,
    executive: 0,
    media: 0,
    presentation: 0,
    storytelling: 0,
    persuasion: 0
  };
}

export interface XpRewardResult {
  overallXp: number;
  skillXp: SkillXpMap;
}

export function calculateXpRewards(
  difficulty: DifficultyTier,
  performanceScore: number,
  primarySkill: SkillBranch
): XpRewardResult {
  const base = BASE_XP_BY_DIFFICULTY[difficulty];
  const performanceMultiplier = performanceScore >= 80 ? 1.3 : performanceScore >= 65 ? 1.1 : 0.9;
  const overallXp = Math.round(base * performanceMultiplier);

  const skillXp = emptySkillXpMap();
  skillXp[primarySkill] = Math.round(overallXp * 0.7);

  return {
    overallXp,
    skillXp
  };
}
