import { redirect } from "next/navigation";
import { resolveUserId } from "../lib/user";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

type AdaptivePlan = {
  steps: Array<{ skill: string; reason: string; durationMinutes: number; reps: number; edgeOfCompetence: boolean }>;
  durationMinutes: number;
  rationale: string;
  edgeFocus: string;
};

type DashboardSummary = {
  sessionStreak: number;
  levelProgress: { level: number; levelTitle: string };
  milestone?: { nextSkillFocus?: string };
};

type CoachResponse = {
  personalProfile?: { speakingIdentity?: string; primaryGoal?: string };
  recentMemory?: Array<{ priorityFix?: string; observedWeakness?: string; situation?: string; createdAt?: string }>;
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

async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const data = await fetchJson<{ preference?: unknown; profile?: unknown }>(
    `${API_BASE}/v1/training/profile/${encodeURIComponent(userId)}`
  );
  return Boolean(data?.preference && data?.profile);
}

export default async function HomePage() {
  const userId = resolveUserId();
  if (!(await hasCompletedOnboarding(userId))) {
    redirect("/onboarding");
  }

  const [planData, dashboardData, coachData] = await Promise.all([
    fetchJson<{ plan: AdaptivePlan }>(`${API_BASE}/v1/training/adaptive-plan/${encodeURIComponent(userId)}`),
    fetchJson<{ dashboard: DashboardSummary }>(`${API_BASE}/v1/dashboard/${encodeURIComponent(userId)}`),
    fetchJson<CoachResponse>(`${API_BASE}/v1/coach/${encodeURIComponent(userId)}/personalization`)
  ]);

  const plan = planData?.plan ?? null;
  const dashboard = dashboardData?.dashboard;
  const coach = coachData;

  const streak = dashboard?.sessionStreak ?? 0;
  const level = dashboard?.levelProgress.level ?? 1;
  const levelTitle = dashboard?.levelProgress.levelTitle ?? "Rookie Speaker";
  const speakingIdentity = coach?.personalProfile?.speakingIdentity ?? "a calm, clear, direct speaker";
  const edgeFocus = plan?.edgeFocus ?? coach?.personalProfile?.primaryGoal ?? "confidence";
  const yesterday = coach?.recentMemory?.[0];

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-6 sm:py-8">
      {/* Hero — single CTA, no choice paralysis */}
      <header className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-brand-700 ring-1 ring-brand-100">
            Day {streak} streak
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
            Level {level} · {levelTitle}
          </span>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-600">Today</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          {streak === 0 ? "Your first rep starts now." : `One more rep as ${speakingIdentity}.`}
        </h1>
        <p className="mt-3 text-sm text-slate-700">
          Body → breath → voice → rep → reflect. About 17 minutes. The whole protocol, in one tap.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href="/today/session"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
          >
            Start today&apos;s session
          </a>
          <a
            href="/practice"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Just one drill
          </a>
        </div>
      </header>

      {/* Yesterday's continuity — only renders if there's something to retry */}
      {yesterday?.priorityFix ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">From yesterday</p>
          <p className="mt-2 text-sm text-amber-900">
            <span className="font-semibold">Priority fix:</span> {yesterday.priorityFix}
          </p>
          {yesterday.situation ? (
            <p className="mt-1 text-xs text-amber-800">
              Context: <span className="font-medium">{yesterday.situation}</span>
            </p>
          ) : null}
          <p className="mt-2 text-xs text-amber-800">
            Today&apos;s rep is the place to apply this. Same prompt format, sharper execution.
          </p>
        </section>
      ) : null}

      {/* What today is about — surfaces the planner reasoning so the user trusts the recommendation */}
      {plan ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Edge focus today</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{edgeFocus.replace(/_/g, " ")}</h2>
          <p className="mt-2 text-sm text-slate-600">{plan.rationale}</p>
        </section>
      ) : null}

      {/* Quiet links to existing modules — preserved per user request, but demoted from competing CTAs */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">When you have more time</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { href: "/practice", label: "Skills & drills" },
            { href: "/dashboard", label: "Progress" },
            { href: "/interview-prep", label: "Interview prep" },
            { href: "/executive-presence", label: "Executive presence" },
            { href: "/networking", label: "Networking" },
            { href: "/difficult-conversations", label: "Difficult conversations" }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
