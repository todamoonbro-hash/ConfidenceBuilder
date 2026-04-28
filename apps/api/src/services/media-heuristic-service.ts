export type MediaHeuristicInput = {
  transcript: string;
  keyMessages: string[];
  durationSeconds: number;
  selfCalmnessRating: number;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function coverageScore(transcript: string, keyMessages: string[]): number {
  if (keyMessages.length === 0) {
    return 35;
  }

  const normalizedTranscript = transcript.toLowerCase();
  const hits = keyMessages.filter((message) => {
    const phrase = message.toLowerCase().trim();
    return phrase.length > 0 && normalizedTranscript.includes(phrase.split(" ")[0]);
  }).length;

  return Math.round((hits / Math.min(4, keyMessages.length)) * 100);
}

function brevityScore(words: number, seconds: number): number {
  if (words === 0 || seconds === 0) {
    return 0;
  }

  const wpm = (words / seconds) * 60;
  if (wpm >= 90 && wpm <= 155) {
    return 100;
  }

  return Math.max(20, 100 - Math.round(Math.abs(122 - wpm)));
}

function keywordRiskScore(transcript: string, riskyTerms: string[]): number {
  const normalized = transcript.toLowerCase();
  const hitCount = riskyTerms.filter((term) => normalized.includes(term)).length;
  return Math.min(100, hitCount * 25);
}

function bridgeQualityScore(transcript: string): number {
  const bridges = ["what matters", "to be clear", "the key point", "what i can say", "let me emphasize"];
  const matched = bridges.filter((phrase) => transcript.toLowerCase().includes(phrase)).length;
  return Math.min(100, 40 + matched * 20);
}

function soundbiteStrengthScore(words: string[]): number {
  if (words.length === 0) {
    return 0;
  }

  const unique = new Set(words).size;
  const density = unique / words.length;
  return Math.round(Math.min(100, 50 + density * 50));
}

export function scoreMediaHeuristic(input: MediaHeuristicInput) {
  const words = tokenize(input.transcript);
  const messageControl = coverageScore(input.transcript, input.keyMessages);
  const brevity = brevityScore(words.length, input.durationSeconds);
  const calmness = Math.round((Math.max(1, Math.min(5, input.selfCalmnessRating)) / 5) * 100);
  const bridgeQuality = bridgeQualityScore(input.transcript);
  const soundbiteStrength = soundbiteStrengthScore(words);
  const clarityForGeneralAudience = Math.max(30, 100 - Math.max(0, words.length - 45));
  const defensivenessRisk = keywordRiskScore(input.transcript, ["that's false", "no comment", "you're wrong", "obviously"]);
  const speculationRisk = keywordRiskScore(input.transcript, ["i think maybe", "probably", "i guess", "off the record"]);

  const total = Math.round(
    messageControl * 0.2 +
      brevity * 0.15 +
      calmness * 0.15 +
      bridgeQuality * 0.15 +
      soundbiteStrength * 0.1 +
      clarityForGeneralAudience * 0.15 +
      (100 - defensivenessRisk) * 0.05 +
      (100 - speculationRisk) * 0.05
  );

  const awardedXp = Math.round(12 + total * 0.4);

  return {
    label: "Media coaching heuristic (not a definitive behavioral assessment)",
    total,
    awardedXp,
    scores: {
      messageControl,
      brevity,
      calmness,
      bridgeQuality,
      soundbiteStrength,
      clarityForGeneralAudience,
      defensivenessRisk,
      speculationRisk
    }
  };
}
