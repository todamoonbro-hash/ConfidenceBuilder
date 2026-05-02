import { DailySessionFlow } from "../../../components/today/daily-session-flow";
import { resolveUserId } from "../../../lib/user";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

type BreathingProtocol = {
  id: string;
  title: string;
  source: string;
  durationSeconds: number;
  intensity: "reset" | "calm" | "energize";
  whenToUse: string;
  steps: Array<{ label: string; seconds: number; cue?: string }>;
  evidenceNote: string;
};

type WarmupDrill = {
  id: string;
  title: string;
  instruction: string;
  examplePhrase?: string;
  durationSeconds?: number;
  targetFocus?: string;
  category?: string;
};

type AdaptivePlan = {
  steps: Array<{ skill: string; reason: string; durationMinutes: number; reps: number; edgeOfCompetence: boolean }>;
  durationMinutes: number;
  rationale: string;
  edgeFocus: string;
};

type ProfileResponse = {
  preference?: { mainGoal?: string; upcomingEvent?: string; confidenceLevel?: number };
  profile?: { weeklyFocus?: string };
};

type CoachResponse = {
  ok?: boolean;
  personalProfile?: {
    speakingIdentity?: string;
    primaryGoal?: string;
    currentRealWorldEvent?: string;
  };
  recentMemory?: Array<{ priorityFix?: string; observedWeakness?: string; createdAt?: string }>;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const FALLBACK_BREATHING: BreathingProtocol = {
  id: "physiological_sigh",
  title: "Physiological Sigh",
  source: "Huberman Lab / Stanford",
  durationSeconds: 90,
  intensity: "reset",
  whenToUse: "When you feel anxious, rushed, or activated.",
  steps: [
    { label: "Inhale through nose", seconds: 3, cue: "Steady, full." },
    { label: "Sip a second short inhale", seconds: 1, cue: "Top up the lungs." },
    { label: "Long exhale through mouth", seconds: 6, cue: "Drop the shoulders." },
    { label: "Repeat for 8 more cycles", seconds: 80, cue: "Slower with each round." }
  ],
  evidenceNote: "Balban & Huberman 2023 (Cell Reports Medicine) — won head-to-head vs box breath, 4-7-8, mindfulness."
};

const FALLBACK_WARMUPS: WarmupDrill[] = [
  {
    id: "vw_humming",
    title: "Humming on 'mmm'",
    instruction: "Lips closed, jaw relaxed, hum a comfortable pitch. Feel buzzing on your lips and the bridge of your nose.",
    examplePhrase: "mmmmm × 5 long breaths",
    durationSeconds: 60,
    targetFocus: "Forward resonance"
  },
  {
    id: "vw_lip_trill",
    title: "Lip trills (brrrr)",
    instruction: "Loose lips, blow gently, let them flutter. Glide low to high pitch.",
    examplePhrase: "brrrrrr (low) → brrrrrr (mid) → brrrrrr (high)",
    durationSeconds: 60,
    targetFocus: "Vocal-fold engagement, breath economy"
  },
  {
    id: "vw_straw_phonation",
    title: "Straw phonation",
    instruction: "Phonate gently through a straw on a comfortable pitch, then slide up and down. (No straw? Pucker lips into a small 'ooo'.)",
    examplePhrase: "ooooo (slow glide low → high)",
    durationSeconds: 90,
    targetFocus: "Vocal economy, reduces strain"
  },
  {
    id: "vw_siren",
    title: "Sirens on 'ng'",
    instruction: "Hum 'nnng' and slide pitch from your lowest to your highest, then back down. No effort, no force.",
    examplePhrase: "nnnnnnnng (low → high → low) ×3",
    durationSeconds: 60,
    targetFocus: "Pitch range, resonance"
  }
];

function pickPromptForGoal(goal: string, edgeFocus: string): string {
  // Lightweight prompt selector tuned to general confidence + public speaking. Keeps the rep
  // grounded in something a real human would actually say tomorrow.
  const promptsByFocus: Record<string, string[]> = {
    confidence: [
      "In 60 seconds: tell me about something you did this week that you're quietly proud of, and why it mattered.",
      "Introduce yourself in one minute as if to someone you respect — make every word land."
    ],
    impromptu: [
      "You have 60 seconds: 'What's one thing most people get wrong about your work?'",
      "Explain in plain language something you understand deeply — start with the headline."
    ],
    public_speaking: [
      "Open a 90-second talk about a change you'd make to how meetings are run. Use one story.",
      "Give a 60-second pitch for a habit you actually keep — start with the result, then the process."
    ],
    executive_communication: [
      "Give a board update on a project that's behind: one sentence on status, one on risk, one on action.",
      "Recommend a decision on whether to hire a new team member, in 90 seconds, using BLUF."
    ],
    articulation: [
      "Read this aloud, slowly first, then again at full pace: 'Clarity costs effort. The price of being understood is being precise.'"
    ]
  };

  const pool =
    promptsByFocus[edgeFocus] ??
    promptsByFocus[goal] ??
    promptsByFocus.confidence;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default async function TodaySessionPage() {
  const userId = resolveUserId();

  // Fetch everything in parallel — the page is a thin wrapper around the orchestrator.
  const [breathingResp, warmupsResp, planResp, profileResp, coachResp] = await Promise.all([
    fetchJson<{ recommended: BreathingProtocol }>(`${API_BASE}/v1/modules/breathing/recommend`),
    fetchJson<{ warmups: WarmupDrill[] }>(`${API_BASE}/v1/modules/articulation/warmups`),
    fetchJson<{ plan: AdaptivePlan }>(`${API_BASE}/v1/training/adaptive-plan/${encodeURIComponent(userId)}`),
    fetchJson<ProfileResponse>(`${API_BASE}/v1/training/profile/${encodeURIComponent(userId)}`),
    fetchJson<CoachResponse>(`${API_BASE}/v1/coach/${encodeURIComponent(userId)}/personalization`)
  ]);

  const breathingProtocol = breathingResp?.recommended ?? FALLBACK_BREATHING;
  const warmupDrills = warmupsResp?.warmups && warmupsResp.warmups.length > 0 ? warmupsResp.warmups : FALLBACK_WARMUPS;
  const sessionPlan = planResp?.plan ?? null;
  const speakingIdentity = coachResp?.personalProfile?.speakingIdentity ?? "a calm, clear, direct speaker";
  const primaryGoal = profileResp?.preference?.mainGoal ?? coachResp?.personalProfile?.primaryGoal ?? "confidence";
  const upcomingEvent = profileResp?.preference?.upcomingEvent ?? coachResp?.personalProfile?.currentRealWorldEvent ?? null;
  const yesterdaysPriorityFix = coachResp?.recentMemory?.[0]?.priorityFix ?? null;

  const edgeFocus = sessionPlan?.edgeFocus ?? primaryGoal;
  const todaysPrompt = pickPromptForGoal(primaryGoal, edgeFocus);

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-6 sm:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Today&apos;s session</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
          Body → breath → voice → rep → reflect.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          About 17 minutes. Order matters. Skip a step and the next one doesn&apos;t work.
        </p>
        {sessionPlan?.rationale ? (
          <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {sessionPlan.rationale}
          </p>
        ) : null}
      </header>

      <DailySessionFlow
        userId={userId}
        speakingIdentity={speakingIdentity}
        primaryGoal={primaryGoal}
        upcomingEvent={upcomingEvent}
        yesterdaysPriorityFix={yesterdaysPriorityFix}
        todaysPrompt={todaysPrompt}
        breathingProtocol={breathingProtocol}
        warmupDrills={warmupDrills.slice(0, 4)}
        sessionPlan={sessionPlan}
      />
    </section>
  );
}
