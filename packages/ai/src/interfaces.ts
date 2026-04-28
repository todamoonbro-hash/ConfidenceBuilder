export interface SttProvider {
  transcribeStream(sessionId: string): AsyncIterable<string>;
}

export interface TtsProvider {
  synthesize(text: string, voiceId?: string): Promise<ArrayBuffer>;
}

export interface LlmFeedbackProvider {
  evaluateAttempt(input: {
    prompt: string;
    transcript: string;
    drillType: string;
  }): Promise<{
    summary: string;
    strengths: string[];
    improvements: string[];
    rubricScores: Record<string, number>;
  }>;
}
