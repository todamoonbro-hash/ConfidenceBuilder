export type RealtimeCoachMode =
  | "interview_simulation"
  | "confidence_check_in"
  | "quick_speaking_warmup"
  | "media_practice"
  | "impromptu_speaking";

type RealtimeTurn = {
  role: "coach" | "user";
  text: string;
  timestamp: string;
};

type RealtimeSession = {
  id: string;
  userId: string;
  mode: RealtimeCoachMode;
  startedAt: string;
  turns: RealtimeTurn[];
};

const realtimeSessions = new Map<string, RealtimeSession>();

const openingByMode: Record<RealtimeCoachMode, string> = {
  interview_simulation: "Let's run an interview simulation. Give me your 30-second value proposition.",
  confidence_check_in: "Quick confidence check-in: how confident do you feel today, and what is one speaking goal?",
  quick_speaking_warmup: "Warmup round: give me a crisp one-minute update on your top priority.",
  media_practice: "Media practice: respond as if you're on camera to a skeptical question.",
  impromptu_speaking: "Impromptu round: explain a complex idea in plain language."
};

function buildCoachReply(mode: RealtimeCoachMode, userText: string) {
  const lower = userText.toLowerCase();
  const fillerCount = (lower.match(/\b(um|uh|like|you know)\b/g) ?? []).length;
  const brevityHint = userText.split(/\s+/).length > 85 ? "Keep it tighter with one headline and two support points." : "Good length. Keep that pace.";
  const confidenceHint = lower.includes("i will") || lower.includes("i recommend") ? "Strong ownership language." : "Use ownership language like 'I will' or 'I recommend'.";
  const modeHint =
    mode === "interview_simulation"
      ? "Now sharpen this for interviewer impact: role fit, proof, and outcome."
      : mode === "media_practice"
        ? "Bridge to one key message and avoid speculative wording."
        : mode === "impromptu_speaking"
          ? "Use answer → reason → example structure."
          : "Make the close specific with one measurable commitment.";

  return `${confidenceHint} ${brevityHint} ${modeHint} ${fillerCount > 0 ? "Also reduce filler words by pausing silently." : ""}`.trim();
}

export function startRealtimeCoachSession(input: { userId: string; mode: RealtimeCoachMode }) {
  const id = `rt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  const opening = openingByMode[input.mode];
  const session: RealtimeSession = {
    id,
    userId: input.userId,
    mode: input.mode,
    startedAt,
    turns: [{ role: "coach", text: opening, timestamp: startedAt }]
  };
  realtimeSessions.set(id, session);

  const realtimeAvailable = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_REALTIME_MODEL);
  return {
    sessionId: id,
    mode: input.mode,
    realtimeAvailable,
    realtimeModel: process.env.OPENAI_REALTIME_MODEL ?? null,
    openingMessage: opening,
    fallbackEnabled: true
  };
}

export function appendRealtimeTurn(input: { sessionId: string; userText: string }) {
  const session = realtimeSessions.get(input.sessionId);
  if (!session) {
    return { ok: false as const, error: "session_not_found" };
  }

  const now = new Date().toISOString();
  session.turns.push({ role: "user", text: input.userText, timestamp: now });
  const coachReply = buildCoachReply(session.mode, input.userText);
  session.turns.push({ role: "coach", text: coachReply, timestamp: new Date().toISOString() });
  realtimeSessions.set(session.id, session);

  return {
    ok: true as const,
    coachReply,
    turns: session.turns
  };
}

export function endRealtimeCoachSession(input: { sessionId: string }) {
  const session = realtimeSessions.get(input.sessionId);
  if (!session) {
    return { ok: false as const, error: "session_not_found" };
  }

  const userTurns = session.turns.filter((turn) => turn.role === "user");
  const summary = {
    whatWorked:
      userTurns.length > 0
        ? "You maintained momentum and responded directly in the live coaching loop."
        : "Session started, but no user response was captured.",
    priorityFix: "Lead with a headline answer, then one reason and one measurable commitment.",
    nextDrill: session.mode
  };

  return {
    ok: true as const,
    sessionId: session.id,
    mode: session.mode,
    transcript: session.turns,
    summary
  };
}
