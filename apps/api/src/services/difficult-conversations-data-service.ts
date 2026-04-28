export const DIFFICULT_SUBSECTIONS = [
  "Negotiation",
  "Conflict",
  "Feedback",
  "Payment / Collections",
  "Salary / Equity",
  "Pushback",
  "Relationship Repair",
  "Reports"
];

export const DIFFICULT_FRAMEWORKS = [
  "SBI",
  "DESC",
  "FBI",
  "Nonviolent Communication",
  "Harvard negotiation",
  "Boundary script",
  "Assertive ask",
  "Repair script"
] as const;

export const DIFFICULT_BADGES = [
  "Boundary Builder",
  "Calm Negotiator",
  "Direct Communicator",
  "Payment Chaser",
  "No Without Guilt",
  "Deal Maker",
  "Conflict Calm"
];

export const DIFFICULT_SCENARIOS = [
  { id: "dc_001", title: "Client has not paid invoice", subsection: "Payment / Collections", pressure: "high", xpReward: 130 },
  { id: "dc_002", title: "Client says they have cashflow problems", subsection: "Payment / Collections", pressure: "high", xpReward: 135 },
  { id: "dc_003", title: "Ask for higher retainer", subsection: "Negotiation", pressure: "moderate", xpReward: 140 },
  { id: "dc_004", title: "Negotiate equity", subsection: "Salary / Equity", pressure: "high", xpReward: 150 },
  { id: "dc_005", title: "Tell someone performance is poor", subsection: "Feedback", pressure: "high", xpReward: 140 },
  { id: "dc_006", title: "Push back on unrealistic timeline", subsection: "Pushback", pressure: "moderate", xpReward: 135 },
  { id: "dc_007", title: "Say no without damaging relationship", subsection: "Relationship Repair", pressure: "moderate", xpReward: 130 },
  { id: "dc_008", title: "Ask for a referral", subsection: "Negotiation", pressure: "moderate", xpReward: 120 },
  { id: "dc_009", title: "Challenge a CEO decision", subsection: "Conflict", pressure: "high", xpReward: 145 },
  { id: "dc_010", title: "Negotiate a job offer", subsection: "Salary / Equity", pressure: "high", xpReward: 145 },
  { id: "dc_011", title: "Handle someone dismissive or rude", subsection: "Conflict", pressure: "severe", xpReward: 150 },
  { id: "dc_012", title: "Recover after tense exchange", subsection: "Relationship Repair", pressure: "moderate", xpReward: 125 }
] as const;

export const PERSONA_STYLES = ["evasive", "defensive", "aggressive", "emotional", "vague", "collaborative"] as const;
export const TONE_TARGETS = ["friendly", "firm", "direct", "diplomatic", "high-authority"] as const;
