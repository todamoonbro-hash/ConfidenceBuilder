export type ImpromptuCategory =
  | "personal_confidence"
  | "explain_simply"
  | "business_decision"
  | "board_question"
  | "investor_challenge"
  | "hostile_question"
  | "storytelling"
  | "media_response";

const promptsByCategory: Record<ImpromptuCategory, string[]> = {
  personal_confidence: [
    "Describe one moment when you doubted yourself and how you recovered.",
    "What daily habit has most improved your confidence and why?",
    "Talk about a time you spoke up when it was easier to stay silent.",
    "Share the piece of feedback that changed how you carry yourself in the room.",
    "Describe what confidence looks like for you on a hard day, not a good day."
  ],
  explain_simply: [
    "Explain cloud computing to a non-technical high school student.",
    "Explain inflation in one minute using a simple real-life example.",
    "Explain what your company does to a curious twelve-year-old.",
    "Explain compound interest using only a story, no numbers.",
    "Explain machine learning to your grandparent in under ninety seconds.",
    "Explain why software has bugs to someone who has never written code."
  ],
  business_decision: [
    "You can fund only one initiative this quarter. How do you choose?",
    "When is it right to stop a project that is emotionally important to the team?",
    "Two top performers want the same promotion. Walk us through how you decide.",
    "Your top customer asks for a feature that hurts your roadmap. What do you tell them?",
    "Revenue is flat for two quarters. What is the first move you make?",
    "A senior leader proposes a strategy you disagree with. How do you handle it in the room?"
  ],
  board_question: [
    "The board says execution is inconsistent. What changes this quarter?",
    "How will you prove strategy is working before the next board meeting?",
    "Walk the board through your plan to extend runway by twelve months without losing key talent.",
    "The board asks why you missed your hiring plan. Answer in under ninety seconds.",
    "A board member challenges your pricing strategy. Defend it.",
    "How do you explain a missed quarter while still rebuilding board confidence?"
  ],
  investor_challenge: [
    "An investor says growth is slowing. Why should they stay patient?",
    "How do you defend runway decisions under tighter market conditions?",
    "An investor asks why a competitor is moving faster than you. Answer.",
    "Pitch the strongest one-sentence reason your company will be worth ten times more in five years.",
    "An investor is skeptical your TAM is real. Convince them in sixty seconds.",
    "Your lead investor wants to slow hiring. You disagree. How does that conversation go?"
  ],
  hostile_question: [
    "A critic says leadership keeps missing commitments. What do you say?",
    "You are accused of avoiding accountability. Respond directly.",
    "A skeptic claims your culture is broken. Respond without getting defensive.",
    "Someone publicly accuses you of taking credit for a junior employee's work. Respond.",
    "A reporter asks if recent layoffs prove you mismanaged growth. Answer.",
    "An employee in an all-hands asks if you actually believe your own roadmap. Answer them honestly."
  ],
  storytelling: [
    "Tell a short story about a setback that shaped your leadership style.",
    "Share a two-minute story about a tough decision with an unexpected outcome.",
    "Tell the story of the first time you fired someone and what it taught you.",
    "Share a moment that changed how you think about ambition.",
    "Tell a story about a mentor who said something that still rings in your head.",
    "Walk us through a time you were wrong in public and what you did next."
  ],
  media_response: [
    "Give a concise on-camera response after a product incident.",
    "Respond to a difficult journalist question while protecting trust.",
    "A reporter asks if you can guarantee this won't happen again. Answer carefully.",
    "Open a sixty-second statement after a security breach affecting customer data.",
    "Respond to a podcast host who pushes back hard on your last public number.",
    "Deliver a thirty-second statement to camera announcing the CEO is stepping down."
  ]
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function startImpromptuPrompt(input?: { category?: ImpromptuCategory; timerSeconds?: 30 | 60 | 90 | 120 }) {
  const category = input?.category ?? "explain_simply";
  const available = promptsByCategory[category] ?? promptsByCategory.explain_simply;
  const selectedPrompt = available[Math.floor(Math.random() * available.length)];
  const timerSeconds = input?.timerSeconds ?? 60;
  return { category, prompt: selectedPrompt, timerSeconds };
}

export function evaluateImpromptuAnswer(input: {
  prompt: string;
  transcript: string;
  durationSeconds: number;
  targetSeconds: number;
  previousTranscript?: string;
}) {
  const words = tokenize(input.transcript);
  const lower = input.transcript.toLowerCase();
  const fillerMatches = lower.match(/\b(um|uh|like|you know|basically|actually)\b/g) ?? [];
  const fillerWords = fillerMatches.length;
  const targetWords = Math.max(1, Math.round((input.targetSeconds / 60) * 145));

  const clarity = Math.max(25, 100 - Math.max(0, fillerWords * 6));
  const structure = lower.includes("first") || lower.includes("second") || lower.includes("finally") ? 84 : 66;
  const confidence = lower.includes("i recommend") || lower.includes("we will") ? 84 : 68;
  const brevity = Math.max(25, 100 - Math.abs(words.length - targetWords));
  const fillerScore = Math.max(20, 100 - fillerWords * 10);
  const answerCompleteness = words.length >= Math.round(targetWords * 0.55) ? 82 : 60;

  const total = Math.round((clarity + structure + confidence + brevity + fillerScore + answerCompleteness) / 6);
  const shouldRetry = total < 78;
  const retryInstruction =
    structure < 72
      ? "Use a simple 3-part structure: answer, reason, concrete example."
      : fillerScore < 70
        ? "Pause silently instead of using filler words."
        : brevity < 70
          ? "Land one clear headline first, then give one supporting point."
          : "Tighten your ending sentence so your recommendation is unmistakable.";

  let improvement;
  let xpAward = 14;
  if (input.previousTranscript) {
    const previousWords = tokenize(input.previousTranscript).length;
    const delta = Math.max(0, total - 70 + Math.max(0, previousWords - words.length));
    improvement = {
      delta,
      summary: delta > 0 ? "Retry improved focus, structure, and delivery control." : "Retry still needs tighter structure and confidence."
    };
    xpAward += Math.max(0, delta);
  }

  return {
    total,
    shouldRetry,
    retryInstruction,
    scores: {
      clarity,
      structure,
      confidence,
      brevity,
      fillerWords: fillerScore,
      answerCompleteness
    },
    diagnostics: {
      fillerWordCount: fillerWords,
      transcriptWordCount: words.length,
      targetSeconds: input.targetSeconds,
      durationSeconds: input.durationSeconds,
      prompt: input.prompt
    },
    improvement,
    xpAward
  };
}
