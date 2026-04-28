export type InterviewMode =
  | "recruiter_screen"
  | "hiring_manager"
  | "panel"
  | "executive"
  | "pe_investor"
  | "case"
  | "technical"
  | "final_round"
  | "stress"
  | "warmup";

export const INTERVIEW_MODES: Array<{ id: InterviewMode; label: string }> = [
  { id: "recruiter_screen", label: "Recruiter screen" },
  { id: "hiring_manager", label: "Hiring manager" },
  { id: "panel", label: "Panel interview" },
  { id: "executive", label: "Executive interview" },
  { id: "pe_investor", label: "PE / investor interview" },
  { id: "case", label: "Case interview" },
  { id: "technical", label: "Technical interview" },
  { id: "final_round", label: "Final round" },
  { id: "stress", label: "Stress interview" },
  { id: "warmup", label: "Warm-up practice" }
];

export const INTERVIEW_FRAMEWORKS = ["STAR", "CAR", "PAR", "SOAR", "Executive answer"] as const;

export const INTERVIEW_CONFIDENCE_DRILLS = [
  "pre-interview breathing drill",
  "posture reset",
  "first-answer warm-up",
  "slow-down drill",
  "concise-answer drill",
  "eye-contact drill",
  "answer-under-pressure drill",
  "pause before answering drill",
  "self-judgment reframing prompt",
  "recovery drill after a poor answer"
];

export const INTERVIEW_BADGES = [
  "Recruiter Ready",
  "STAR Master",
  "Pressure Proof",
  "Executive Presence",
  "Concise Communicator",
  "Weakness Reframer",
  "Final Round Ready",
  "Calm Under Fire",
  "Metrics-Driven",
  "Story Bank Builder"
];

export const INTERVIEW_QUESTIONS = {
  general: [
    "Tell me about yourself",
    "Walk me through your background",
    "Why this role?",
    "Why this company?",
    "Why are you leaving?",
    "What are your strengths?",
    "What are your weaknesses?",
    "What are your salary expectations?",
    "What motivates you?",
    "Where do you want to be in 3–5 years?"
  ],
  behavioural: [
    "Tell me about a time you led through change",
    "Tell me about a conflict",
    "Tell me about a failure",
    "Tell me about a difficult stakeholder",
    "Tell me about a time you influenced without authority",
    "Tell me about a time you had to deliver bad news",
    "Tell me about a time you improved performance",
    "Tell me about a time you built a team",
    "Tell me about a time you made a hard decision with imperfect data"
  ],
  executive: [
    "How do you build trust with a CEO?",
    "How do you manage a board?",
    "How do you create KPI discipline?",
    "How do you manage liquidity pressure?",
    "How do you approach M&A integration?",
    "How do you lead a finance team through transformation?",
    "How do you operate in a PE-backed environment?",
    "How do you balance strategy and hands-on execution?",
    "What would you do in your first 90 days?",
    "How do you handle underperformance?"
  ],
  pressure: [
    "I’m not sure you have enough industry experience",
    "You seem overqualified",
    "You seem too strategic",
    "You do not speak the local language fluently",
    "Why have you had advisory roles rather than permanent roles?",
    "Why should we choose you over an internal candidate?",
    "What is your biggest failure?",
    "What would your critics say about you?",
    "Convince me in 60 seconds",
    "I do not understand your value proposition"
  ]
} as const;
