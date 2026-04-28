export type ListeningDrillType =
  | "listen_and_summarise"
  | "listen_and_answer"
  | "paraphrase_then_answer"
  | "identify_real_question"
  | "detect_tone_intent"
  | "answer_hidden_concern";

type ListeningPrompt = {
  id: string;
  drillType: ListeningDrillType;
  promptText: string;
  expectedFocus: string[];
  expectedTone?: "neutral" | "concerned" | "skeptical" | "urgent";
};

const listeningPrompts: ListeningPrompt[] = [
  {
    id: "listen_sum_001",
    drillType: "listen_and_summarise",
    promptText: "The product launch went well in Europe, but support wait times doubled in North America and customer complaints rose.",
    expectedFocus: ["launch", "support wait times", "complaints"]
  },
  {
    id: "listen_answer_001",
    drillType: "listen_and_answer",
    promptText: "A client asks: can you guarantee delivery by Friday, and what risk remains?",
    expectedFocus: ["delivery by friday", "risk", "guarantee"]
  },
  {
    id: "listen_para_001",
    drillType: "paraphrase_then_answer",
    promptText: "Your manager says: I need confidence that this plan protects margin, not just growth.",
    expectedFocus: ["protects margin", "not just growth", "confidence"]
  },
  {
    id: "listen_realq_001",
    drillType: "identify_real_question",
    promptText: "The board asks for another roadmap update, but keeps returning to execution consistency.",
    expectedFocus: ["execution consistency", "real question", "proof"]
  },
  {
    id: "listen_tone_001",
    drillType: "detect_tone_intent",
    promptText: "An investor says: I have heard this timeline twice already, so help me understand why this time is different.",
    expectedFocus: ["timeline", "why different", "credibility"],
    expectedTone: "skeptical"
  },
  {
    id: "listen_hidden_001",
    drillType: "answer_hidden_concern",
    promptText: "A customer says the feature list looks strong, but they are not sure your team can support deployment.",
    expectedFocus: ["support deployment", "capability", "confidence"],
    expectedTone: "concerned"
  }
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function startListeningDrill(input?: { drillType?: ListeningDrillType }) {
  const drillType = input?.drillType ?? "listen_and_summarise";
  const options = listeningPrompts.filter((item) => item.drillType === drillType);
  const selected = options[Math.floor(Math.random() * options.length)] ?? listeningPrompts[0];
  return selected;
}

export function evaluateListeningResponse(input: { prompt: ListeningPrompt; transcript: string; durationSeconds: number }) {
  const transcriptWords = normalize(input.transcript);
  const transcriptLower = input.transcript.toLowerCase();

  const matchedFocusCount = input.prompt.expectedFocus.filter((keyword) => transcriptLower.includes(keyword.toLowerCase())).length;
  const summaryAccuracy = Math.round((matchedFocusCount / Math.max(1, input.prompt.expectedFocus.length)) * 100);
  const relevance = transcriptWords.length > 0 ? Math.max(30, summaryAccuracy - 10 + Math.min(20, transcriptWords.length / 4)) : 20;
  const answerAlignment = input.prompt.drillType === "identify_real_question" && transcriptLower.includes("real question") ? 85 : Math.max(35, summaryAccuracy);
  const concision = Math.max(25, 100 - Math.max(0, transcriptWords.length - 70));

  let toneRecognition = 70;
  if (input.prompt.expectedTone === "skeptical") {
    toneRecognition = transcriptLower.includes("skeptical") || transcriptLower.includes("concern") ? 85 : 62;
  }
  if (input.prompt.expectedTone === "concerned") {
    toneRecognition = transcriptLower.includes("concern") || transcriptLower.includes("reassure") ? 85 : 62;
  }

  const total = Math.round((summaryAccuracy + relevance + answerAlignment + concision + toneRecognition) / 5);
  const awardedXp = Math.max(12, Math.round(total / 4));

  const feedback = {
    summaryAccuracy:
      summaryAccuracy >= 80
        ? "You captured the core message accurately."
        : "Capture the main points first before adding interpretation.",
    relevance: relevance >= 75 ? "Your response stayed on topic." : "Stay closer to what was asked; remove side points.",
    answerAlignment: answerAlignment >= 75 ? "Your answer aligned with the question intent." : "Directly answer the question intent before expanding.",
    concision: concision >= 75 ? "Good brevity and pace." : "Tighten the response to one headline and two support lines.",
    toneRecognition: toneRecognition >= 75 ? "You recognized tone/intent well." : "Explicitly acknowledge the speaker's tone or concern."
  };

  return {
    total,
    awardedXp,
    scores: { summaryAccuracy, relevance, answerAlignment, concision, toneRecognition },
    diagnostics: {
      matchedFocusCount,
      expectedFocusCount: input.prompt.expectedFocus.length,
      transcriptWordCount: transcriptWords.length,
      durationSeconds: input.durationSeconds
    },
    feedback
  };
}
