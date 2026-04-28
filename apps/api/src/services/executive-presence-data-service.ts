export type ExecutiveScenario = {
  id: string;
  title: string;
  subsection: string;
  brief: string;
  persona: "board_member" | "investor" | "ceo" | "pe_partner" | "journalist" | "customer" | "staff" | "banker" | "chairman";
  pressureLevel: "moderate" | "high" | "severe";
  xpReward: number;
};

export const EXECUTIVE_SUBSECTIONS = [
  "Boardroom Q&A",
  "Investor Update",
  "Crisis Communication",
  "Leadership Briefing",
  "Hard Questions",
  "Concise Executive Answers",
  "Presence Drills",
  "Reports"
];

export const EXECUTIVE_FRAMEWORKS = [
  "BLUF",
  "PREP",
  "SCQA",
  "Minto Pyramid Principle",
  "Headline, Evidence, Implication, Recommendation",
  "What happened, what it means, what we are doing, what we need"
] as const;

export const EXECUTIVE_DRILLS = [
  "15-second answer drill",
  "One-sentence answer drill",
  "Hard question recovery drill",
  "Pause and answer drill",
  "Say the uncomfortable truth drill",
  "Defend the number drill",
  "Bridge back to message drill",
  "Boardroom calm drill"
];

export const EXECUTIVE_BADGES = [
  "Boardroom Ready badge",
  "Calm Under Fire badge",
  "BLUF Master badge",
  "Investor Grade badge",
  "Crisis Communicator badge"
];

export const EXECUTIVE_SCENARIOS: ExecutiveScenario[] = [
  { id: "ep_001", title: "Board asks why performance is behind plan", subsection: "Boardroom Q&A", brief: "Explain underperformance and corrective action without sounding defensive.", persona: "board_member", pressureLevel: "high", xpReward: 140 },
  { id: "ep_002", title: "Investor challenges the forecast", subsection: "Investor Update", brief: "Defend forecast assumptions and downside plan.", persona: "investor", pressureLevel: "high", xpReward: 150 },
  { id: "ep_003", title: "CEO asks for recommendation with incomplete data", subsection: "Leadership Briefing", brief: "Make a clear recommendation despite uncertainty.", persona: "ceo", pressureLevel: "high", xpReward: 145 },
  { id: "ep_004", title: "PE partner questions cost base", subsection: "Hard Questions", brief: "Respond with facts, trade-offs, and specific levers.", persona: "pe_partner", pressureLevel: "severe", xpReward: 160 },
  { id: "ep_005", title: "Team challenges a restructure", subsection: "Leadership Briefing", brief: "Address concerns while preserving trust and authority.", persona: "staff", pressureLevel: "moderate", xpReward: 130 },
  { id: "ep_006", title: "Media asks about company issue", subsection: "Crisis Communication", brief: "Give accountable but controlled public response.", persona: "journalist", pressureLevel: "high", xpReward: 150 },
  { id: "ep_007", title: "Customer escalates serious complaint", subsection: "Crisis Communication", brief: "Calmly acknowledge, own, and propose remedy.", persona: "customer", pressureLevel: "high", xpReward: 135 },
  { id: "ep_008", title: "Staff member pushes back in town hall", subsection: "Hard Questions", brief: "Handle challenge in public setting with clarity and respect.", persona: "staff", pressureLevel: "high", xpReward: 135 },
  { id: "ep_009", title: "Banker asks about liquidity", subsection: "Investor Update", brief: "Provide liquidity narrative and contingency plan.", persona: "banker", pressureLevel: "high", xpReward: 150 },
  { id: "ep_010", title: "Acquisition target pushes back on valuation", subsection: "Boardroom Q&A", brief: "Defend valuation logic while keeping negotiation optionality.", persona: "investor", pressureLevel: "severe", xpReward: 165 },
  { id: "ep_011", title: "Chairman interrupts and asks for the point", subsection: "Concise Executive Answers", brief: "Land BLUF in one sentence, then evidence.", persona: "chairman", pressureLevel: "severe", xpReward: 155 },
  { id: "ep_012", title: "Board asks what you would do in first 90 days", subsection: "Boardroom Q&A", brief: "Present focused executive plan with sequencing.", persona: "board_member", pressureLevel: "moderate", xpReward: 140 }
];
