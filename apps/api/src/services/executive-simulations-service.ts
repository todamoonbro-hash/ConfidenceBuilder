export type ExecutiveSimulationMode =
  | "cfo_interview"
  | "recruiter_screen"
  | "investor_pitch_qa"
  | "board_update"
  | "difficult_stakeholder_conversation"
  | "presentation_rehearsal"
  | "leadership_update"
  | "media_adjacent_executive_questioning";

export type InterviewerStyle = "supportive" | "neutral" | "challenging" | "aggressive_but_professional";

const modeQuestions: Record<ExecutiveSimulationMode, string> = {
  cfo_interview: "Margins are under pressure. What concrete levers will you pull in the next quarter?",
  recruiter_screen: "Why are you the right executive fit for this role right now?",
  investor_pitch_qa: "Your growth story is clear, but where is the downside risk and mitigation plan?",
  board_update: "What is your board-level narrative on performance, risk, and next-quarter priorities?",
  difficult_stakeholder_conversation: "A critical stakeholder says your team overpromised and underdelivered. How do you respond?",
  presentation_rehearsal: "Give your opening executive message for tomorrow's high-stakes presentation.",
  leadership_update: "How do you communicate a difficult strategic pivot without losing leadership trust?",
  media_adjacent_executive_questioning: "A journalist asks if leadership has lost control of execution. What is your response?"
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function startExecutiveSimulation(input?: { mode?: ExecutiveSimulationMode; style?: InterviewerStyle }) {
  const mode = input?.mode ?? "board_update";
  const style = input?.style ?? "neutral";
  const openingQuestion = modeQuestions[mode];
  return {
    mode,
    style,
    openingQuestion,
    scenarioBrief: `Simulation mode: ${mode.replace(/_/g, " ")}. Interviewer style: ${style.replace(/_/g, " ")}.`
  };
}

export function evaluateExecutiveResponse(input: {
  mode: ExecutiveSimulationMode;
  style: InterviewerStyle;
  question: string;
  transcript: string;
  previousTranscript?: string;
}) {
  const words = tokenize(input.transcript);
  const lower = input.transcript.toLowerCase();
  const wordCount = words.length;

  const executivePresence = lower.includes("we will") || lower.includes("i will") ? 84 : 68;
  const commercialSharpness = lower.includes("margin") || lower.includes("cash") || lower.includes("risk") ? 82 : 66;
  const clarity = Math.max(30, 100 - Math.max(0, wordCount - 90));
  const brevity = Math.max(25, 100 - Math.max(0, wordCount - 65));
  const confidence = lower.includes("i recommend") || lower.includes("our plan") ? 84 : 67;
  const answerStructure = lower.includes("first") || lower.includes("second") || lower.includes("third") ? 86 : 64;

  const total = Math.round((executivePresence + commercialSharpness + clarity + brevity + confidence + answerStructure) / 6);
  const shouldRetry = total < 80;

  const followUpQuestion =
    input.style === "aggressive_but_professional"
      ? "Your answer sounds polished, but what hard tradeoff are you willing to make immediately?"
      : input.style === "challenging"
        ? "What evidence will convince skeptical stakeholders within 30 days?"
        : "What single commitment should we hold you accountable for next?";

  const structureCoaching =
    answerStructure < 72
      ? "Use: headline decision, two supporting facts, and one clear commitment."
      : "Strong structure; make the close sharper with one measurable commitment.";

  const improvedAnswerSuggestion =
    "Headline: We are prioritizing disciplined execution on margin, risk, and accountability. Facts: We are reducing cost leakage, tightening review cadence, and protecting high-value delivery. Commitment: I will report measurable progress within 30 days.";

  let improvement;
  let xpAward = 15;
  if (input.previousTranscript) {
    const previousWords = tokenize(input.previousTranscript).length;
    const delta = Math.max(0, total - 72 + Math.max(0, previousWords - wordCount));
    improvement = {
      delta,
      summary: delta > 0 ? "Retry improved executive control and answer structure." : "Retry still needs sharper structure and clearer commercial focus."
    };
    xpAward += Math.max(0, delta);
  }

  return {
    total,
    shouldRetry,
    followUpQuestion,
    structureCoaching,
    improvedAnswerSuggestion,
    scores: { executivePresence, commercialSharpness, clarity, brevity, confidence, answerStructure },
    improvement,
    xpAward
  };
}
