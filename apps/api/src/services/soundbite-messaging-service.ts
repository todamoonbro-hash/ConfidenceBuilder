const jargonTerms = [
  "synergy",
  "leverage",
  "paradigm",
  "stakeholder alignment",
  "bandwidth",
  "low-hanging fruit",
  "operationalize",
  "vertical"
];

const hedgingTerms = ["maybe", "kind of", "sort of", "i think", "probably", "possibly"];
const defensiveTerms = ["that's not true", "you are wrong", "no comment", "obviously", "to be fair"];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function takeWords(text: string, count: number): string {
  return words(text)
    .slice(0, count)
    .join(" ");
}

export function transformToSoundbites(input: { answer: string }) {
  const answer = input.answer.trim();
  const sentences = splitSentences(answer);
  const coreMessage = sentences[0] ?? answer;

  const sec10 = takeWords(answer, 24);
  const sec20 = takeWords(answer, 48);
  const sec45 = takeWords(answer, 108);

  const plainEnglishVersion = answer
    .replace(/utilize/gi, "use")
    .replace(/approximately/gi, "about")
    .replace(/commence/gi, "start")
    .replace(/facilitate/gi, "help");

  const executiveVersion = `Bottom line: ${coreMessage}. The plan is focused, measurable, and accountable.`;
  const mediaSafeVersion = `${coreMessage}. We will stick to verified facts and share updates as they are confirmed.`;

  const lower = answer.toLowerCase();
  const jargonFlags = jargonTerms.filter((term) => lower.includes(term));
  const hedgingFlags = hedgingTerms.filter((term) => lower.includes(term));
  const defensiveFlags = defensiveTerms.filter((term) => lower.includes(term));

  const strongerLandingLine = `${coreMessage}. What matters most is clear action and measurable results.`;

  return {
    coreMessage,
    soundbites: {
      tenSecond: sec10,
      twentySecond: sec20,
      fortyFiveSecond: sec45
    },
    versions: {
      plainEnglish: plainEnglishVersion,
      executive: executiveVersion,
      mediaSafe: mediaSafeVersion
    },
    flags: {
      jargon: jargonFlags,
      hedging: hedgingFlags,
      defensive: defensiveFlags
    },
    strongerLandingLine
  };
}

export function scoreSoundbitePractice(input: {
  originalAnswer: string;
  practiceTranscript: string;
  targetSoundbite: string;
  selfRating: number;
}) {
  const originalWords = words(input.originalAnswer).length;
  const practiceWords = words(input.practiceTranscript).length;
  const targetWords = words(input.targetSoundbite).length;

  const brevity = Math.max(0, 100 - Math.abs(practiceWords - targetWords) * 4);
  const clarity = Math.max(20, 100 - Math.max(0, practiceWords - 60));
  const memorability = Math.max(20, 100 - new Set(words(input.practiceTranscript)).size + Math.round(input.selfRating * 8));

  const improvementRatio = originalWords > 0 ? Math.max(0, Math.min(1, (originalWords - practiceWords) / originalWords)) : 0;
  const improvementBonusXp = Math.round(improvementRatio * 25);
  const completionXp = 18;

  const total = Math.round((brevity + clarity + memorability) / 3);

  return {
    total,
    scores: {
      brevity,
      clarity,
      memorability
    },
    xpAward: {
      completionXp,
      improvementBonusXp,
      totalXp: completionXp + improvementBonusXp
    },
    note: "Soundbite scoring is a coaching heuristic, not a substitute for editorial/phonetic analysis."
  };
}
