import type { Quest, UserQuestProgress } from "../db/types";

export interface QuestAdvanceResult {
  updated: UserQuestProgress;
  stepCompleted: boolean;
  questCompleted: boolean;
}

export function advanceQuestStep(
  progress: UserQuestProgress,
  quest: Quest,
  exerciseId: string
): QuestAdvanceResult {
  const nextStep = quest.steps[progress.currentStepIndex];

  if (!nextStep || nextStep.exerciseId !== exerciseId) {
    return {
      updated: progress,
      stepCompleted: false,
      questCompleted: progress.status === "completed"
    };
  }

  const completedStepIds = [...progress.completedStepIds, nextStep.id];
  const nextIndex = progress.currentStepIndex + 1;
  const completed = nextIndex >= quest.steps.length;

  const updated: UserQuestProgress = {
    ...progress,
    currentStepIndex: completed ? progress.currentStepIndex : nextIndex,
    completedStepIds,
    status: completed ? "completed" : "active",
    completedAt: completed ? new Date().toISOString() : progress.completedAt
  };

  return {
    updated,
    stepCompleted: true,
    questCompleted: completed
  };
}
