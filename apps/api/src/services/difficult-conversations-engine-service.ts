import { DIFFICULT_SCENARIOS } from "./difficult-conversations-data-service";

type Session = {
  id: string;
  userId: string;
  scenarioId: string;
  framework: string;
  toneTarget: "friendly" | "firm" | "direct" | "diplomatic" | "high-authority";
  personaStyle: "evasive" | "defensive" | "aggressive" | "emotional" | "vague" | "collaborative";
  pressureMode: boolean;
  status: "active" | "completed";
  turns: Array<{ role: "persona" | "user"; text: string }>;
};

const sessions: Session[] = [];

function nextReply(style: Session["personaStyle"], answer: string, pressure: boolean) {
  if (pressure && !/\d|deadline|date|next step|recommend|ask/i.test(answer)) {
    return "You're still vague. What exactly are you asking for, by when, and what happens if we can't agree?";
  }
  if (style === "evasive") return "I hear you, but let's revisit this later. Why is this urgent now?";
  if (style === "aggressive") return "That sounds unrealistic. Why should I accept this?";
  if (style === "defensive") return "Are you saying this is my fault?";
  if (style === "emotional") return "This feels unfair. Can we slow down?";
  if (style === "vague") return "Maybe. What do you specifically mean by that?";
  return "Understood. What next step do you propose?";
}

export function startDifficultConversationSession(payload: {
  userId: string;
  scenarioId: string;
  framework: string;
  toneTarget: Session["toneTarget"];
  personaStyle: Session["personaStyle"];
  pressureMode: boolean;
}) {
  const scenario = DIFFICULT_SCENARIOS.find((item) => item.id === payload.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  const session: Session = {
    id: `dc_sess_${String(sessions.length + 1).padStart(3, "0")}`,
    userId: payload.userId,
    scenarioId: scenario.id,
    framework: payload.framework,
    toneTarget: payload.toneTarget,
    personaStyle: payload.personaStyle,
    pressureMode: payload.pressureMode,
    status: "active",
    turns: [{ role: "persona", text: `${scenario.title}. Let's begin. What's your ask?` }]
  };
  sessions.push(session);
  return { ok: true as const, scenario, session };
}

export function appendDifficultConversationTurn(payload: { sessionId: string; answer: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.status === "active");
  if (!session) return { ok: false as const, error: "session_not_found" };

  session.turns.push({ role: "user", text: payload.answer });
  const response = nextReply(session.personaStyle, payload.answer, session.pressureMode);
  session.turns.push({ role: "persona", text: response });
  return { ok: true as const, session, personaReply: response };
}

export function endDifficultConversationSession(payload: { sessionId: string; userId: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.userId === payload.userId);
  if (!session) return { ok: false as const, error: "session_not_found" };
  session.status = "completed";

  const scenario = DIFFICULT_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  const text = session.turns.filter((turn) => turn.role === "user").map((turn) => turn.text).join(" ");
  const base = Math.max(40, Math.min(95, 62 + Math.floor(text.length / 35) - (session.pressureMode ? 5 : 0)));

  const report = {
    scores: {
      clarity: Math.max(35, base + 1),
      firmness: Math.max(35, base + (session.toneTarget === "firm" || session.toneTarget === "direct" ? 3 : -2)),
      empathy: Math.max(35, base + (session.toneTarget === "friendly" || session.toneTarget === "diplomatic" ? 3 : -1)),
      boundarySetting: Math.max(35, base + (/boundary|cannot|need|must/i.test(text) ? 4 : -3)),
      specificity: Math.max(35, base + (/\d|date|deadline|terms|next step/i.test(text) ? 4 : -4)),
      commercialStrength: Math.max(35, base + (/value|terms|price|fee|equity|invoice/i.test(text) ? 4 : -2)),
      calmness: Math.max(35, base - (session.personaStyle === "aggressive" ? 1 : 0)),
      listening: Math.max(35, base - 1),
      avoidOverExplaining: Math.max(35, base - (text.length > 450 ? 8 : 0)),
      nextStepControl: Math.max(35, base + (/next step|by|date|follow up/i.test(text) ? 5 : -3)),
      relationshipPreservation: Math.max(35, base + (session.toneTarget === "diplomatic" ? 2 : 0)),
      confidence: Math.max(35, base)
    },
    feedback: {
      softenedTooMuch: session.toneTarget === "friendly" && !/must|need|ask|request/i.test(text),
      soundedAggressive: session.toneTarget === "direct" && /always|never|obviously/i.test(text),
      noClearAsk: !/ask|request|propose|next step/i.test(text),
      gaveAwayLeverage: /whatever works|anything is fine|no problem/i.test(text),
      overExplained: text.length > 450,
      strongerSuggestedWording: "My ask is clear: we need agreement on this by Friday, otherwise we will pause delivery and reconfirm scope.",
      nextDrill: scenario.title
    }
  };

  const xpEarned = Math.round(scenario.xpReward * (session.pressureMode ? 1.2 : 1));
  const earnedBadges = [
    report.scores.boundarySetting >= 78 ? "Boundary Builder" : null,
    report.scores.calmness >= 78 ? "Calm Negotiator" : null,
    report.scores.firmness >= 78 ? "Direct Communicator" : null,
    scenario.subsection === "Payment / Collections" ? "Payment Chaser" : null,
    scenario.id === "dc_007" ? "No Without Guilt" : null,
    scenario.subsection === "Negotiation" ? "Deal Maker" : null,
    scenario.subsection === "Conflict" ? "Conflict Calm" : null
  ].filter(Boolean);

  return { ok: true as const, session, scenario, report, xpEarned, earnedBadges };
}
