import { EXECUTIVE_SCENARIOS, type ExecutiveScenario } from "./executive-presence-data-service";

type Session = {
  id: string;
  userId: string;
  scenarioId: string;
  framework: string;
  pressureMode: boolean;
  timeLimitSeconds: 15 | 30 | 60 | 120;
  status: "active" | "completed";
  turns: Array<{ role: "persona" | "user"; text: string; elapsedSeconds?: number }>;
};

const sessions: Session[] = [];

function followUp(scenario: ExecutiveScenario, answer: string, pressureMode: boolean) {
  const lacksNumber = !/\d/.test(answer);
  if (pressureMode && answer.length > 220) return "You are too long. 20 seconds. What's your point and recommendation?";
  if (pressureMode && lacksNumber) return "I need numbers, not adjectives. Give me one concrete metric.";
  if (/recommend|proposal|should/i.test(answer) === false) return "What exactly do you recommend we do now?";
  return `${scenario.persona === "chairman" ? "Chairman" : "Board"}: What is the key risk in your plan and how will you mitigate it?`;
}

export function startExecutivePresenceSession(payload: { userId: string; scenarioId: string; framework: string; pressureMode: boolean; timeLimitSeconds: 15 | 30 | 60 | 120 }) {
  const scenario = EXECUTIVE_SCENARIOS.find((item) => item.id === payload.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };
  const opening = `${scenario.title}. Answer now with BLUF and recommendation.`;
  const session: Session = {
    id: `ep_sess_${String(sessions.length + 1).padStart(3, "0")}`,
    userId: payload.userId,
    scenarioId: scenario.id,
    framework: payload.framework,
    pressureMode: payload.pressureMode,
    timeLimitSeconds: payload.timeLimitSeconds,
    status: "active",
    turns: [{ role: "persona", text: opening }]
  };
  sessions.push(session);
  return { ok: true as const, scenario, session };
}

export function appendExecutivePresenceTurn(payload: { sessionId: string; answer: string; elapsedSeconds?: number }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.status === "active");
  if (!session) return { ok: false as const, error: "session_not_found" };
  const scenario = EXECUTIVE_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  session.turns.push({ role: "user", text: payload.answer, elapsedSeconds: payload.elapsedSeconds });
  const next = followUp(scenario, payload.answer, session.pressureMode);
  session.turns.push({ role: "persona", text: next });
  return { ok: true as const, session, followUp: next };
}

export function endExecutivePresenceSession(payload: { sessionId: string; userId: string }) {
  const session = sessions.find((item) => item.id === payload.sessionId && item.userId === payload.userId);
  if (!session) return { ok: false as const, error: "session_not_found" };
  session.status = "completed";
  const scenario = EXECUTIVE_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) return { ok: false as const, error: "scenario_not_found" };

  const answers = session.turns.filter((turn) => turn.role === "user");
  const text = answers.map((item) => item.text).join(" ");
  const avgElapsed = answers.length > 0 ? answers.reduce((sum, item) => sum + (item.elapsedSeconds ?? session.timeLimitSeconds), 0) / answers.length : session.timeLimitSeconds;
  const base = Math.max(42, Math.min(96, 64 + Math.floor(text.length / 30) - (session.pressureMode ? 4 : 0) - (avgElapsed > session.timeLimitSeconds ? 8 : 0)));

  const report = {
    executivePresenceScore: base,
    dimensions: {
      structure: Math.max(35, base + 2),
      directness: Math.max(35, base + 1),
      confidence: Math.max(35, base - 1),
      brevity: Math.max(35, base - (avgElapsed > session.timeLimitSeconds ? 10 : 0)),
      evidence: Math.max(35, base + (/\d/.test(text) ? 4 : -7)),
      composure: Math.max(35, base - (session.pressureMode ? 2 : 0)),
      executiveMaturity: Math.max(35, base + 1)
    },
    checks: {
      answeredActualQuestion: /because|recommend|we should|i would/i.test(text),
      tooLong: avgElapsed > session.timeLimitSeconds,
      ledWithPoint: /^(we should|my recommendation|bottom line|the point)/i.test(answers[0]?.text?.trim() ?? ""),
      soundedDefensive: /but|to be fair|honestly/i.test(text),
      usedEvidence: /\d/.test(text),
      clearRecommendation: /recommend|we should|i propose|next step/i.test(text),
      createdConfidence: base >= 72
    },
    topFix: "Lead with one-sentence recommendation, then one metric, then one risk mitigation.",
    transcript: text
  };

  const xpEarned = Math.round(scenario.xpReward * (session.pressureMode ? 1.25 : 1));
  const earnedBadges = [
    report.executivePresenceScore >= 80 ? "Boardroom Ready badge" : null,
    report.checks.createdConfidence ? "Calm Under Fire badge" : null,
    report.checks.ledWithPoint ? "BLUF Master badge" : null,
    report.checks.usedEvidence ? "Investor Grade badge" : null,
    scenario.subsection === "Crisis Communication" ? "Crisis Communicator badge" : null
  ].filter(Boolean);

  return { ok: true as const, session, scenario, report, xpEarned, earnedBadges };
}
