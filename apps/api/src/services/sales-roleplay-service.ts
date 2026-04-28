import { SALES_FRAMEWORKS, SALES_PERSONAS, SALES_SCENARIOS, type PracticeMode } from "./sales-influence-data-service";
import { buildSalesSessionReport } from "./sales-scoring-service";

export type SalesRoleplaySession = {
  id: string;
  userId: string;
  scenarioId: string;
  frameworkId: string;
  mode: PracticeMode;
  startedAt: string;
  status: "active" | "completed";
  turns: Array<{ role: "persona" | "user"; text: string }>;
};

const roleplaySessions: SalesRoleplaySession[] = [];
const pitchBank: Array<{ userId: string; createdAt: string; scenarioId: string; bestLine: string; strongerVersion: string }> = [];

function generatePersonaReply(args: { userText: string; scenarioTitle: string; personaName: string; mode: PracticeMode }): string {
  const pressureTag = args.mode === "elite" ? "I'm going to interrupt you if this is vague." : args.mode === "pressure" ? "Keep it tight." : "";
  const prompt = args.userText.toLowerCase();
  if (prompt.includes("price") || prompt.includes("cost")) {
    return `${args.personaName}: Your pricing sounds high. What's the concrete ROI and payback period? ${pressureTag}`.trim();
  }
  if (prompt.includes("next step") || prompt.includes("pilot")) {
    return `${args.personaName}: What exact owner, timeline, and success metric would you lock for this ${args.scenarioTitle} conversation?`;
  }
  return `${args.personaName}: I hear the direction. Give me one sharper proof point and one clear action you'd like from me.`;
}

export function listSalesInfluenceLibrary() {
  return {
    frameworks: SALES_FRAMEWORKS,
    personas: SALES_PERSONAS,
    scenarios: SALES_SCENARIOS
  };
}

export function startSalesRoleplaySession(payload: { userId: string; scenarioId: string; frameworkId?: string; mode: PracticeMode }) {
  const scenario = SALES_SCENARIOS.find((item) => item.id === payload.scenarioId);
  if (!scenario) {
    return { ok: false as const, error: "scenario_not_found" };
  }

  const framework = SALES_FRAMEWORKS.find((item) => item.id === (payload.frameworkId ?? scenario.suggestedFramework)) ?? SALES_FRAMEWORKS[0];
  const persona = SALES_PERSONAS.find((item) => item.name.toLowerCase() === scenario.aiPersonaProfile.toLowerCase()) ?? SALES_PERSONAS[1];

  const session: SalesRoleplaySession = {
    id: `si_sess_${String(roleplaySessions.length + 1).padStart(3, "0")}`,
    userId: payload.userId,
    scenarioId: scenario.id,
    frameworkId: framework.id,
    mode: payload.mode,
    startedAt: new Date().toISOString(),
    status: "active",
    turns: [
      {
        role: "persona",
        text: `${persona.name}: ${scenario.scenarioBrief} Start whenever you're ready. I will challenge assumptions and ask for concrete next steps.`
      }
    ]
  };

  roleplaySessions.push(session);
  return { ok: true as const, session, scenario, framework, persona };
}

export function appendSalesRoleplayTurn(payload: { sessionId: string; userText: string }) {
  const session = roleplaySessions.find((item) => item.id === payload.sessionId && item.status === "active");
  if (!session) {
    return { ok: false as const, error: "session_not_found" };
  }
  const scenario = SALES_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) {
    return { ok: false as const, error: "scenario_not_found" };
  }

  const persona = SALES_PERSONAS.find((item) => item.name.toLowerCase() === scenario.aiPersonaProfile.toLowerCase()) ?? SALES_PERSONAS[1];
  const cleanText = payload.userText.trim();

  session.turns.push({ role: "user", text: cleanText });
  const reply = generatePersonaReply({ userText: cleanText, scenarioTitle: scenario.title, personaName: persona.name, mode: session.mode });
  session.turns.push({ role: "persona", text: reply });

  return { ok: true as const, session, personaReply: reply };
}

export function endSalesRoleplaySession(payload: { sessionId: string; userId: string }) {
  const session = roleplaySessions.find((item) => item.id === payload.sessionId && item.userId === payload.userId);
  if (!session) {
    return { ok: false as const, error: "session_not_found" };
  }

  const scenario = SALES_SCENARIOS.find((item) => item.id === session.scenarioId);
  if (!scenario) {
    return { ok: false as const, error: "scenario_not_found" };
  }

  session.status = "completed";
  const transcript = session.turns.filter((turn) => turn.role === "user").map((turn) => turn.text).join(" ").trim();
  const report = buildSalesSessionReport({
    scenario,
    frameworkId: session.frameworkId,
    mode: session.mode,
    transcript,
    turns: session.turns
  });

  return { ok: true as const, session, report, scenario };
}

export function saveToPitchBank(payload: { userId: string; scenarioId: string; bestLine: string; strongerVersion: string }) {
  const entry = { ...payload, createdAt: new Date().toISOString() };
  pitchBank.push(entry);
  return entry;
}

export function listPitchBank(userId: string) {
  return pitchBank.filter((item) => item.userId === userId);
}
