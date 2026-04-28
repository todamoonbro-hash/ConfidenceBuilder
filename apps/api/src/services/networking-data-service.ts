export const NETWORKING_SUBSECTIONS = ["Small Talk", "Introductions", "Rapport", "Follow-up", "Asking for Help", "LinkedIn Voice Practice", "Events", "Reports"];

export const NETWORKING_FRAMEWORKS = [
  "Warm opener: context, observation, question",
  "Value intro: who I am, what I do, why it matters",
  "Curious follow-up: listen, mirror, ask",
  "Soft ask: context, reason, specific request, easy out",
  "Relationship follow-up: reference, value, next step",
  "Exit: appreciation, reason, next step"
] as const;

export const NETWORKING_SCENARIOS = [
  { id: "net_001", title: "Introduce yourself at a networking event", subsection: "Introductions", xpReward: 105 },
  { id: "net_002", title: "Start conversation with a senior executive", subsection: "Small Talk", xpReward: 115 },
  { id: "net_003", title: "Reconnect with an old contact", subsection: "Follow-up", xpReward: 110 },
  { id: "net_004", title: "Ask someone for an introduction", subsection: "Asking for Help", xpReward: 120 },
  { id: "net_005", title: "Ask recruiter for role update", subsection: "Follow-up", xpReward: 115 },
  { id: "net_006", title: "Follow up after a meeting", subsection: "Follow-up", xpReward: 110 },
  { id: "net_007", title: "Explain what you are looking for without sounding desperate", subsection: "Rapport", xpReward: 120 },
  { id: "net_008", title: "Speak to someone you admire", subsection: "Events", xpReward: 110 },
  { id: "net_009", title: "Exit a conversation politely", subsection: "Small Talk", xpReward: 95 },
  { id: "net_010", title: "Recover from awkward silence", subsection: "Small Talk", xpReward: 105 },
  { id: "net_011", title: "Ask a contact for advice", subsection: "Asking for Help", xpReward: 110 },
  { id: "net_012", title: "Build rapport with a potential investor", subsection: "Rapport", xpReward: 125 }
] as const;

export const NETWORKING_PERSONAS = ["senior_executive", "recruiter", "old_colleague", "peer_operator", "investor", "conference_attendee"] as const;

export const NETWORKING_BADGES = ["Rapport Builder", "Confident Intro", "Natural Networker", "Strong Ask", "Follow-up Pro", "No Awkward Silence"];
