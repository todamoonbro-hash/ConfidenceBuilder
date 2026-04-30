export type ReadingMode = "guided_reading" | "cold_reading" | "executive_business_reading" | "story_narrative_reading" | "difficult_text_mode";

export type PassageDifficulty = "easy" | "medium" | "hard";
export type PassageLength = "short" | "medium" | "long";

export type ReadingPassage = {
  id: string;
  title: string;
  mode: ReadingMode;
  type: "business" | "narrative" | "technical" | "news";
  difficulty: PassageDifficulty;
  length: PassageLength;
  skillFocus: string[];
  text: string;
  chunkedPhrases: string[];
};

const passages: ReadingPassage[] = [
  {
    id: "read_guided_001",
    title: "Guided: Clear team update",
    mode: "guided_reading",
    type: "business",
    difficulty: "easy",
    length: "short",
    skillFocus: ["pacing", "pauses", "fluency"],
    text: "Today we completed the first milestone. The team reduced processing delays and improved response quality. Next week we will validate results with pilot customers and publish a clear action plan.",
    chunkedPhrases: [
      "Today we completed the first milestone.",
      "The team reduced processing delays and improved response quality.",
      "Next week we will validate results with pilot customers / and publish a clear action plan."
    ]
  },
  {
    id: "read_cold_001",
    title: "Cold: Unseen project summary",
    mode: "cold_reading",
    type: "news",
    difficulty: "medium",
    length: "medium",
    skillFocus: ["recovery", "expression", "accuracy"],
    text: "Analysts noted that the rollout moved faster than forecast, but unresolved onboarding gaps increased support tickets. Leaders emphasized that quality controls, not speed alone, will determine long-term adoption and customer trust.",
    chunkedPhrases: [
      "Analysts noted that the rollout moved faster than forecast,",
      "but unresolved onboarding gaps increased support tickets.",
      "Leaders emphasized that quality controls, not speed alone, / will determine long-term adoption and customer trust."
    ]
  },
  {
    id: "read_exec_001",
    title: "Executive: Quarterly briefing",
    mode: "executive_business_reading",
    type: "business",
    difficulty: "medium",
    length: "medium",
    skillFocus: ["executive tone", "pauses", "clarity"],
    text: "Revenue grew in priority segments, while margin pressure persisted in legacy channels. Our operating plan now focuses on disciplined cost actions, stronger retention in high-value accounts, and tighter execution against quarterly commitments.",
    chunkedPhrases: [
      "Revenue grew in priority segments,",
      "while margin pressure persisted in legacy channels.",
      "Our operating plan now focuses on disciplined cost actions,",
      "stronger retention in high-value accounts, / and tighter execution against quarterly commitments."
    ]
  },
  {
    id: "read_story_001",
    title: "Story: The bridge at dawn",
    mode: "story_narrative_reading",
    type: "narrative",
    difficulty: "easy",
    length: "short",
    skillFocus: ["expression", "rhythm", "pauses"],
    text: "At dawn, Maya crossed the old bridge and listened to the river below. She paused, took a breath, and finally spoke the words she had rehearsed all night. The morning felt lighter as the city slowly woke.",
    chunkedPhrases: [
      "At dawn, Maya crossed the old bridge and listened to the river below.",
      "She paused, took a breath, and finally spoke the words she had rehearsed all night.",
      "The morning felt lighter / as the city slowly woke."
    ]
  },
  {
    id: "read_hard_001",
    title: "Difficult text: Technical compliance note",
    mode: "difficult_text_mode",
    type: "technical",
    difficulty: "hard",
    length: "long",
    skillFocus: ["complex diction", "recovery", "fluency"],
    text: "The organization must reconcile cross-jurisdiction reporting obligations with evolving data residency controls, while preserving auditability and incident-response traceability. Failure to standardize exception handling could introduce regulatory exposure, inconsistent remediation timelines, and avoidable operational risk.",
    chunkedPhrases: [
      "The organization must reconcile cross-jurisdiction reporting obligations",
      "with evolving data residency controls, while preserving auditability and incident-response traceability.",
      "Failure to standardize exception handling / could introduce regulatory exposure,",
      "inconsistent remediation timelines, and avoidable operational risk."
    ]
  }
];

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function listReadingPassages(filter?: Partial<Pick<ReadingPassage, "mode" | "difficulty" | "type" | "length">> & { skillFocus?: string }) {
  return passages.filter((passage) => {
    if (filter?.mode && passage.mode !== filter.mode) return false;
    if (filter?.difficulty && passage.difficulty !== filter.difficulty) return false;
    if (filter?.type && passage.type !== filter.type) return false;
    if (filter?.length && passage.length !== filter.length) return false;
    if (filter?.skillFocus && !passage.skillFocus.includes(filter.skillFocus)) return false;
    return true;
  });
}

export function findReadingPassage(passageId: string) {
  return passages.find((item) => item.id === passageId);
}

export function compareTranscriptToSource(sourceText: string, transcript: string) {
  const source = normalize(sourceText);
  const heard = normalize(transcript);

  const skippedWords: string[] = [];
  const repeatedWords: string[] = [];
  const substitutions: Array<{ expected: string; actual: string }> = [];

  const heardCounts = new Map<string, number>();
  for (const word of heard) {
    heardCounts.set(word, (heardCounts.get(word) ?? 0) + 1);
  }

  for (const sourceWord of source) {
    if (!heardCounts.has(sourceWord)) {
      skippedWords.push(sourceWord);
    }
  }

  for (const [word, count] of heardCounts.entries()) {
    const sourceCount = source.filter((item) => item === word).length;
    if (count > sourceCount) {
      repeatedWords.push(word);
    }
  }

  const minLength = Math.min(source.length, heard.length);
  for (let index = 0; index < minLength; index += 1) {
    if (source[index] !== heard[index]) {
      substitutions.push({ expected: source[index], actual: heard[index] });
    }
  }

  const accuracyRatio = source.length > 0 ? Math.max(0, 1 - (skippedWords.length + substitutions.length * 0.6) / source.length) : 0;

  return {
    skippedWords: [...new Set(skippedWords)].slice(0, 12),
    repeatedWords: [...new Set(repeatedWords)].slice(0, 12),
    substitutions: substitutions.slice(0, 12),
    accuracyScore: Math.round(accuracyRatio * 100)
  };
}

export function evaluateReadAloudAttempt(input: { passage: ReadingPassage; transcript: string; durationSeconds: number }) {
  const comparison = compareTranscriptToSource(input.passage.text, input.transcript);
  const wordCount = normalize(input.transcript).length;
  const wordsPerMinute = input.durationSeconds > 0 ? Math.round((wordCount / input.durationSeconds) * 60) : 0;
  const pacingScore = wordsPerMinute === 0 ? 20 : Math.max(30, 100 - Math.abs(145 - wordsPerMinute));
  const pauseControlScore = input.transcript.includes(",") || input.transcript.includes(".") ? 80 : 62;
  const fluencyScore = Math.max(25, Math.round((comparison.accuracyScore * 0.65 + pacingScore * 0.35)));
  const expressionScore = input.passage.mode === "story_narrative_reading" ? 82 : 74;
  const recoveryScore = comparison.substitutions.length > 0 ? 75 : 82;

  const total = Math.round((pacingScore + pauseControlScore + fluencyScore + expressionScore + recoveryScore) / 5);
  const awardedXp = Math.max(12, Math.round(total / 4) + Math.max(0, 90 - comparison.skippedWords.length * 3) / 10);

  return {
    total,
    awardedXp,
    comparison,
    metrics: {
      wordsPerMinute,
      pacingScore,
      pauseControlScore,
      fluencyScore,
      expressionScore,
      recoveryScore
    },
    feedback: {
      pacing: wordsPerMinute > 165 ? "Pace was fast; slow down slightly for clearer articulation." : wordsPerMinute < 120 ? "Pace was slow; aim for a steadier forward rhythm." : "Pacing was in a strong target range.",
      pauses: pauseControlScore >= 75 ? "Pauses were controlled and helped structure meaning." : "Add short pauses at punctuation to improve clarity.",
      fluency: comparison.accuracyScore >= 80 ? "Fluency was stable with strong source-text alignment." : "Fluency dipped with skips/substitutions; prioritize line-by-line accuracy first.",
      expression: input.passage.mode === "story_narrative_reading" ? "Use voice contrast on emotional words to strengthen narrative delivery." : "Use emphasis on key business terms to improve executive clarity.",
      recovery: comparison.substitutions.length <= 2 ? "Recovery after slips was solid-keep moving without restarting." : "When mistakes happen, quickly recover to the next phrase instead of stopping."
    }
  };
}
