import type { DrillScore } from "../../types/src";

export const DEFAULT_WEIGHTS = {
  confidence: 0.2,
  clarity: 0.2,
  fluency: 0.2,
  coherence: 0.2,
  persuasion: 0.2
} as const;

export function calculateDrillScore(score: DrillScore): number {
  return (
    score.confidence * DEFAULT_WEIGHTS.confidence +
    score.clarity * DEFAULT_WEIGHTS.clarity +
    score.fluency * DEFAULT_WEIGHTS.fluency +
    score.coherence * DEFAULT_WEIGHTS.coherence +
    score.persuasion * DEFAULT_WEIGHTS.persuasion
  );
}
