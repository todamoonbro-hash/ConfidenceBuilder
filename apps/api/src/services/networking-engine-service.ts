import { NETWORKING_SCENARIOS } from "./networking-data-service";

type Session = {
  id: string;
  userId: string;
  scenarioId: string;
  framework: string;
  persona: string;
  status: "active" | "completed";
  turns: Array<{ role: "persona" | "user"; text: string }>;
};

const sessions: Session[] = [];
const desperationPatterns = [/desperate/i, /please please/i, /sorry to bother/i, /anything/i, /i'll take anything/i, /just give me a chance/i];

function personaReply(answer: string, persona: string) {
  if (!/\?/.test(answer)) return "Thanks. Ask me one thoughtful question so this feels like a real conversation.";
  if (answer.length > 240) return "Could you tighten that to 1-2 sentences?";
  if (persona === "investor") return "Interesting. What traction or signal should I care about most?";
  if (persona === "recruiter") return "Helpful. What exact role scope are you targeting?";
  return "Great, tell me more about what you're currently building and why now.";
}

export function startNetworkingSession(payload: { userId: string; scenarioId: string; framework: string; persona: string }) {
  const scenario = NETWORKING_SCENARIOS.find((item) => item.id === payload.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  const session: Session = {
    id: `net_sess_${String(sessions.length + 1).padStart(3, "0")}`,
    userId: payload.userId,
    scenarioId: scenario.id,
    framework: payload.framework,
    persona: payload.persona,
    status: "active",
    turns: [{ role: "persona", text: `${scenario.title}. Start naturally.` }]
  };
  sessions.push(session);
  return { ok: true as const, scenario, session };
}

export function appendNetworkingTurn(payload: { sessionId: string; text: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.status === "active");
  if (!session) return { ok: false as const, error: "session_not_found" };
  session.turns.push({ role: "user", text: payload.text });
  const reply = personaReply(payload.text, session.persona);
  session.turns.push({ role: "persona", text: reply });
  return { ok: true as const, session, personaReply: reply };
}

export function endNetworkingSession(payload: { sessionId: string; userId: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.userId === payload.userId);
  if (!session) return { ok: false as const, error: "session_not_found" };
  session.status = "completed";

  const scenario = NETWORKING_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  const text = session.turns.filter((turn) => turn.role === "user").map((turn) => turn.text).join(" ");
  const desperationHits = desperationPatterns.filter((pattern) => pattern.test(text));
  const base = Math.max(45, Math.min(95, 64 + Math.floor(text.length / 40) - desperationHits.length * 6));

  const report = {
    scores: {
      warmth: Math.max(35, base + 2),
      clarity: Math.max(35, base + 1),
      confidence: Math.max(35, base - desperationHits.length * 4),
      specificity: Math.max(35, base + (/\d|specific|target|role|sector/i.test(text) ? 3 : -3)),
      conversationalFlow: Math.max(35, base + (/\?/.test(text) ? 2 : -3)),
      curiosity: Math.max(35, base + ((text.match(/\?/g) || []).length >= 1 ? 3 : -4)),
      listening: Math.max(35, base - 1),
      overTalking: Math.max(35, base - (text.length > 420 ? 8 : 0)),
      askQuality: Math.max(35, base + (/ask|introduc|referral|next step|would you be open/i.test(text) ? 4 : -4)),
      statusPresence: Math.max(35, base + (/value|impact|focus|build/i.test(text) ? 2 : -2)),
      naturalness: Math.max(35, base + (desperationHits.length === 0 ? 2 : -5))
    },
    rapportScore: Math.max(35, base + 2),
    askClarityScore: Math.max(35, base + (/next step|specific request|would you/i.test(text) ? 5 : -3)),
    desperationDetector: {
      triggered: desperationHits.length > 0,
      signals: desperationHits.map((pattern) => pattern.source),
      coaching: desperationHits.length > 0 ? "Replace apologetic language with a confident, specific ask and an easy out." : "No desperation signals detected."
    },
    followUpDraft: `Great meeting you today. I appreciated your perspective on ${scenario.title.toLowerCase()}. If helpful, I can send a one-page summary and a clear next step for us to consider.`
  };

  const xpEarned = Math.round(scenario.xpReward * (desperationHits.length === 0 ? 1.1 : 1));
  const earnedBadges = [
    report.rapportScore >= 78 ? "Rapport Builder" : null,
    scenario.id === "net_001" || scenario.id === "net_002" ? "Confident Intro" : null,
    report.scores.naturalness >= 78 ? "Natural Networker" : null,
    report.askClarityScore >= 78 ? "Strong Ask" : null,
    scenario.subsection === "Follow-up" ? "Follow-up Pro" : null,
    scenario.id === "net_010" ? "No Awkward Silence" : null
  ].filter(Boolean);

  return { ok: true as const, scenario, session, report, xpEarned, earnedBadges };
}
