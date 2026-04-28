export type CrisisScenarioType =
  | "company_underperformance"
  | "job_gap_career_challenge"
  | "unpaid_invoices_commercial_dispute"
  | "failed_transaction"
  | "investor_concern"
  | "employee_issue"
  | "public_mistake"
  | "market_downturn"
  | "hostile_journalist_question"
  | "board_challenge";

const scenarioQuestions: Record<CrisisScenarioType, string> = {
  company_underperformance: "Your company missed guidance by 20%. Why should stakeholders trust your plan now?",
  job_gap_career_challenge: "You have a two-year career gap. Why should we trust your readiness for this role now?",
  unpaid_invoices_commercial_dispute: "Vendors say they are unpaid for months. What went wrong and when will this be resolved?",
  failed_transaction: "A high-profile transaction failed after months of negotiation. What is your accountability?",
  investor_concern: "Investors worry cash runway is shrinking. What concrete actions will you take this quarter?",
  employee_issue: "Reports suggest employee morale and retention are falling. What are you doing immediately?",
  public_mistake: "A public communication error damaged trust. Why should the public believe your next message?",
  market_downturn: "In a severe downturn, what hard decisions are you making and how will you protect resilience?",
  hostile_journalist_question: "Critics say leadership hid key facts. Did you mislead the public?",
  board_challenge: "The board questions your execution discipline. Why should they keep confidence in your leadership?"
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function startCrisisSimulation(scenarioType: CrisisScenarioType) {
  const question = scenarioQuestions[scenarioType];
  return {
    scenarioType,
    openingQuestion: question,
    followUpQuestion: "What is the single most important action you will take in the next 30 days?"
  };
}

export function evaluateCrisisAnswer(input: {
  question: string;
  transcript: string;
  previousTranscript?: string;
}): {
  total: number;
  scores: {
    composure: number;
    messageControl: number;
    clarity: number;
    honesty: number;
    brevity: number;
    speculationAvoidance: number;
    bridgeQuality: number;
    executivePresence: number;
  };
  oneFix: string;
  shouldRetry: boolean;
  retryQuestion: string;
  improvement?: { delta: number; summary: string };
  xpAward: number;
} {
  const words = tokenize(input.transcript);
  const wordCount = words.length;
  const lower = input.transcript.toLowerCase();

  const composure = Math.max(20, 100 - (lower.match(/!|\?/g)?.length ?? 0) * 8);
  const messageControl = lower.includes("what matters") || lower.includes("key point") ? 85 : 62;
  const clarity = Math.max(25, 100 - Math.max(0, wordCount - 80));
  const honesty = lower.includes("we made") || lower.includes("i take") ? 82 : 65;
  const brevity = Math.max(20, 100 - Math.max(0, wordCount - 55));
  const speculationAvoidance = lower.includes("maybe") || lower.includes("probably") ? 55 : 82;
  const bridgeQuality = lower.includes("what i can say") || lower.includes("to be clear") ? 84 : 60;
  const executivePresence = lower.includes("plan") || lower.includes("next") ? 80 : 64;

  const total = Math.round(
    (composure + messageControl + clarity + honesty + brevity + speculationAvoidance + bridgeQuality + executivePresence) / 8
  );

  const oneFix =
    brevity < 70
      ? "Give one headline answer first, then one action and one timeline."
      : messageControl < 70
        ? "State your key message explicitly, then bridge back to it once."
        : speculationAvoidance < 70
          ? "Remove speculative phrases and stick to verified facts."
          : "Tighten your closing line so stakeholders remember one clear commitment.";

  const shouldRetry = total < 75;
  const retryQuestion = input.question;

  let improvement;
  let xpAward = 16;

  if (input.previousTranscript) {
    const previousWords = tokenize(input.previousTranscript).length;
    const brevityImprovement = previousWords > 0 ? Math.round(((previousWords - wordCount) / previousWords) * 100) : 0;
    const delta = Math.max(0, Math.round((total - 65) / 2) + Math.max(0, brevityImprovement));
    improvement = {
      delta,
      summary: delta > 0 ? "Retry showed stronger control and tighter structure." : "Retry needs clearer structure and tighter message control."
    };
    xpAward += Math.max(0, delta);
  }

  return {
    total,
    scores: {
      composure,
      messageControl,
      clarity,
      honesty,
      brevity,
      speculationAvoidance,
      bridgeQuality,
      executivePresence
    },
    oneFix,
    shouldRetry,
    retryQuestion,
    improvement,
    xpAward
  };
}
