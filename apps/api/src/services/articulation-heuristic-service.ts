export type ArticulationHeuristicInput = {
  transcript: string;
  examplePhrase: string;
  durationSeconds: number;
  selfRating: number;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function completenessScore(transcriptWords: string[], expectedWords: string[]): number {
  if (expectedWords.length === 0) {
    return 0;
  }

  const transcriptSet = new Set(transcriptWords);
  const covered = expectedWords.filter((word) => transcriptSet.has(word)).length;
  return Math.round((covered / expectedWords.length) * 100);
}

function repeatedWordPenalty(words: string[]): { repeatedRuns: number; score: number } {
  let repeatedRuns = 0;
  for (let index = 1; index < words.length; index += 1) {
    if (words[index] === words[index - 1]) {
      repeatedRuns += 1;
    }
  }

  const score = Math.max(0, 100 - repeatedRuns * 12);
  return { repeatedRuns, score };
}

function substitutionEstimate(expectedWords: string[], spokenWords: string[]): { count: number; score: number } {
  const patterns: Array<{ expected: string; alternatives: string[] }> = [
    { expected: "th", alternatives: ["d", "t"] },
    { expected: "r", alternatives: ["l"] },
    { expected: "l", alternatives: ["r"] }
  ];

  let count = 0;
  const pairs = Math.min(expectedWords.length, spokenWords.length);

  for (let index = 0; index < pairs; index += 1) {
    const expected = expectedWords[index];
    const spoken = spokenWords[index];

    for (const pattern of patterns) {
      if (expected.includes(pattern.expected) && pattern.alternatives.some((candidate) => spoken.includes(candidate))) {
        count += 1;
        break;
      }
    }
  }

  return {
    count,
    score: Math.max(0, 100 - count * 10)
  };
}

function paceScore(words: number, durationSeconds: number): { wordsPerMinute: number; score: number } {
  if (durationSeconds <= 0 || words === 0) {
    return { wordsPerMinute: 0, score: 0 };
  }

  const wordsPerMinute = Math.round((words / durationSeconds) * 60);
  const targetMin = 95;
  const targetMax = 155;

  if (wordsPerMinute >= targetMin && wordsPerMinute <= targetMax) {
    return { wordsPerMinute, score: 100 };
  }

  const distance = wordsPerMinute < targetMin ? targetMin - wordsPerMinute : wordsPerMinute - targetMax;
  return { wordsPerMinute, score: Math.max(20, 100 - distance) };
}

export function scoreArticulationHeuristic(input: ArticulationHeuristicInput) {
  const transcriptWords = tokenize(input.transcript);
  const expectedWords = tokenize(input.examplePhrase);

  const completeness = completenessScore(transcriptWords, expectedWords);
  const repetition = repeatedWordPenalty(transcriptWords);
  const substitutions = substitutionEstimate(expectedWords, transcriptWords);
  const pace = paceScore(transcriptWords.length, input.durationSeconds);
  const selfRatingNormalized = Math.max(1, Math.min(5, input.selfRating));
  const selfRatingScore = Math.round((selfRatingNormalized / 5) * 100);

  const total = Math.round(
    completeness * 0.3 + repetition.score * 0.15 + substitutions.score * 0.2 + pace.score * 0.2 + selfRatingScore * 0.15
  );

  const awardedXp = Math.round(10 + total * 0.35);

  return {
    label: "Articulation coaching heuristic (not phoneme-precise analysis)",
    total,
    awardedXp,
    factors: {
      transcriptCompleteness: completeness,
      repeatedWordsScore: repetition.score,
      repeatedWordRuns: repetition.repeatedRuns,
      substitutionEstimateScore: substitutions.score,
      substitutionEstimateCount: substitutions.count,
      paceScore: pace.score,
      wordsPerMinute: pace.wordsPerMinute,
      userSelfRatingScore: selfRatingScore
    }
  };
}
