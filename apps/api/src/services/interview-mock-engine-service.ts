import { INTERVIEW_MODES, INTERVIEW_QUESTIONS, type InterviewMode } from "./interview-data-service";

type InterviewSession = {
  id: string;
  userId: string;
  mode: InterviewMode;
  status: "active" | "completed";
  turns: Array<{ role: "interviewer" | "candidate"; text: string }>;
  askedQuestions: string[];
};

const sessions: InterviewSession[] = [];

type ScoreDimension = {
  score: number;
  note: string;
};

const DIMENSIONS = [
  "directness", "structure", "relevance", "specificity", "evidenceMetrics", "seniority", "selfAwareness", "confidence", "warmth", "conciseness", "authenticity", "strategicClarity", "roleFit", "companyFit", "handlingRiskWeakness", "vocalDelivery", "fillerWords", "pace", "energy", "eyeContactBodyLanguage"
] as const;

function pickQuestion(mode: InterviewMode, askedCount: number) {
  if (mode === "stress") return INTERVIEW_QUESTIONS.pressure[askedCount % INTERVIEW_QUESTIONS.pressure.length];
  if (mode === "executive" || mode === "pe_investor") return INTERVIEW_QUESTIONS.executive[askedCount % INTERVIEW_QUESTIONS.executive.length];
  if (mode === "technical") return INTERVIEW_QUESTIONS.behavioural[askedCount % INTERVIEW_QUESTIONS.behavioural.length];
  return INTERVIEW_QUESTIONS.general[askedCount % INTERVIEW_QUESTIONS.general.length];
}

export function startInterviewSession(payload: { userId: string; mode: InterviewMode }) {
  const openingQuestion = pickQuestion(payload.mode, 0);
  const session: InterviewSession = {
    id: `int_${String(sessions.length + 1).padStart(3, "0")}`,
    userId: payload.userId,
    mode: payload.mode,
    status: "active",
    turns: [{ role: "interviewer", text: openingQuestion }],
    askedQuestions: [openingQuestion]
  };
  sessions.push(session);
  return { session, openingQuestion };
}

export function appendInterviewTurn(payload: { sessionId: string; answer: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.status === "active");
  if (!session) return { ok: false as const, error: "session_not_found" };

  session.turns.push({ role: "candidate", text: payload.answer });

  const lower = payload.answer.toLowerCase();
  let followUp = "Can you give me one specific example with metrics?";
  if (lower.length < 80) followUp = "Please add more concrete detail and the business impact.";
  else if (!/\d/.test(lower)) followUp = "What measurable result did you achieve?";
  else if (session.mode === "stress") followUp = "I still don't buy it. Why should we choose you over internal candidates?";
  else followUp = pickQuestion(session.mode, session.askedQuestions.length);

  session.turns.push({ role: "interviewer", text: followUp });
  session.askedQuestions.push(followUp);

  return { ok: true as const, session, followUp };
}

export function endInterviewSession(payload: { sessionId: string; userId: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.userId === payload.userId);
  if (!session) return { ok: false as const, error: "session_not_found" };

  session.status = "completed";
  const answers = session.turns.filter((turn) => turn.role === "candidate").map((turn) => turn.text);
  const transcript = answers.join(" ");
  const fillerCount = transcript.split(/\s+/).filter((word) => ["um", "uh", "like"].includes(word.toLowerCase())).length;
  const scoreBase = Math.max(45, Math.min(95, 58 + Math.floor(transcript.length / 25) - fillerCount));
  const dimensionScores = Object.fromEntries(
    DIMENSIONS.map((dimension, index) => [dimension, { score: Math.max(35, Math.min(98, scoreBase + ((index % 6) - 3))), note: `Improve ${dimension} by being more concrete and concise.` }])
  ) as Record<string, ScoreDimension>;

  const entries = Object.entries(dimensionScores).sort((a, b) => b[1].score - a[1].score);
  const report = {
    overallReadinessScore: scoreBase,
    hireabilitySignal: scoreBase >= 78 ? "strong" : scoreBase >= 65 ? "developing" : "at_risk",
    topStrengths: entries.slice(0, 3).map(([name]) => name),
    topRisks: entries.slice(-3).map(([name]) => name),
    bestAnswer: answers.reduce((best, cur) => (cur.length > best.length ? cur : best), answers[0] ?? ""),
    weakestAnswer: answers.reduce((best, cur) => (cur.length < best.length ? cur : best), answers[0] ?? ""),
    answerNeedsMoreEvidence: answers.find((answer) => !/\d/.test(answer)) ?? answers[0] ?? "",
    answerTooLong: answers.find((answer) => answer.length > 260) ?? "",
    answerSoundedDefensive: answers.find((answer) => /but|however|to be fair/i.test(answer)) ?? "",
    missingStories: ["Conflict story", "Failure + recovery story"],
    recommendedStoryBankUpdates: ["Add one quantified leadership turnaround story", "Add one stakeholder conflict resolution story"],
    nextPracticeSession: session.mode === "stress" ? "Warm-up practice" : "Stress interview",
    dimensions: dimensionScores,
    transcript,
    askedQuestions: session.askedQuestions
  };

  return { ok: true as const, session, report, xpEarned: 90 + Math.round(scoreBase * 0.8), readinessScore: scoreBase };
}

export function listInterviewModes() {
  return INTERVIEW_MODES;
}
