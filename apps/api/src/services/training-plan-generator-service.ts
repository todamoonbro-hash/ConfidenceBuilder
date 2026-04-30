import type { DifficultyTier, GameProgress, QuestStep, SkillBranch, UserDailyMissionProgress } from "../db/types";

import { adjustDifficulty } from "./difficulty-adjustment-service";
import { calculateXpRewards } from "./xp-calculation-service";

export interface AdaptiveTrainingStep {
  id: string;
  type: "read_aloud" | "speaking" | "feedback" | "retry" | "reflection";
  prompt: string;
  xpReward: number;
  skillXpReward: number;
  primarySkill: SkillBranch;
  linkedQuestStepId?: string;
}

export interface AdaptiveDailyPlan {
  userId: string;
  date: string;
  difficulty: DifficultyTier;
  steps: AdaptiveTrainingStep[];
  totalXpReward: number;
  totalSkillXpReward: number;
  recommendedNextDrill: SkillBranch;
  weeklyBossChallenge: string;
}

function recommendNextDrill(progress: GameProgress): SkillBranch {
  const entries = Object.entries(progress.skillXp) as Array<[SkillBranch, number]>;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

export function generateAdaptiveDailyPlan(input: {
  userId: string;
  today: string;
  progress: GameProgress;
  activeQuestStep?: QuestStep;
  activeMissions?: UserDailyMissionProgress[];
}): AdaptiveDailyPlan {
  const difficulty = adjustDifficulty(input.progress.currentDifficulty, input.progress.recentPerformanceScores);
  const nextSkill = recommendNextDrill(input.progress);

  const readReward = calculateXpRewards(difficulty, 72, "reading");
  const speakingReward = calculateXpRewards(difficulty, 76, nextSkill);

  const questStepPrompt = input.activeQuestStep
    ? `${input.activeQuestStep.title}: ${input.activeQuestStep.description}`
    : `Deliver a concise 60-second speaking response at ${difficulty} difficulty.`;

  const questSkill = input.activeQuestStep?.targetSkill ?? nextSkill;

  const steps: AdaptiveTrainingStep[] = [
    {
      id: "step_read_aloud",
      type: "read_aloud",
      prompt: "Read aloud with controlled pacing and clear articulation.",
      xpReward: readReward.overallXp,
      skillXpReward: readReward.skillXp.reading,
      primarySkill: "reading"
    },
    {
      id: "step_speaking",
      type: "speaking",
      prompt: questStepPrompt,
      xpReward: speakingReward.overallXp,
      skillXpReward: speakingReward.skillXp[questSkill],
      primarySkill: questSkill,
      linkedQuestStepId: input.activeQuestStep?.id
    },
    {
      id: "step_feedback",
      type: "feedback",
      prompt: "Review feedback and identify one priority fix.",
      xpReward: 10,
      skillXpReward: 5,
      primarySkill: "confidence"
    },
    {
      id: "step_retry",
      type: "retry",
      prompt: "Retry once using the priority fix with improved clarity.",
      xpReward: 15,
      skillXpReward: 8,
      primarySkill: "confidence"
    },
    {
      id: "step_reflection",
      type: "reflection",
      prompt: "Write a short reflection on what improved and what to repeat tomorrow.",
      xpReward: 8,
      skillXpReward: 4,
      primarySkill: "storytelling"
    }
  ];

  const totalXpReward = steps.reduce((sum, step) => sum + step.xpReward, 0);
  const totalSkillXpReward = steps.reduce((sum, step) => sum + step.skillXpReward, 0);

  void input.activeMissions;

  return {
    userId: input.userId,
    date: input.today,
    difficulty,
    steps,
    totalXpReward,
    totalSkillXpReward,
    recommendedNextDrill: nextSkill,
    weeklyBossChallenge: "Beginner Boardroom Challenge"
  };
}
