export type DrillType =
  | "articulation"
  | "read_aloud"
  | "impromptu"
  | "public_speaking"
  | "interview"
  | "executive_communication"
  | "listening_response";

export interface DrillScore {
  drillType: DrillType;
  confidence: number;
  clarity: number;
  fluency: number;
  coherence: number;
  persuasion: number;
}
