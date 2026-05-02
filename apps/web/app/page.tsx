import { redirect } from "next/navigation";
import { resolveUserId } from "../lib/user";

type DashboardSummary = {
  sessionStreak: number;
  levelProgress: { level: number; levelTitle: string };
  nextRecommendedDrill: { id: string; title: string; drillType: string } | null;
  milestone: { nextSkillFocus: string };
};

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

async function loadHomeSummary(userId: string): Promise<DashboardSummary | null> {
  try {
    const response = await fetch(`${API_BASE}/v1/dashboard/${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { dashboard?: DashboardSummary };
    return payload.dashboard ?? null;
  } catch {
    return null;
  }
}

// New users have no training profile yet — send them straight to onboarding so the first 10 minutes
// produce a tailored plan instead of dropping them on a generic dashboard.
async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/v1/training/profile/${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!response.ok) return false;
    const payload = (await response.json()) as { preference?: unknown; profile?: unknown };
    return Boolean(payload.preference && payload.profile);
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const userId = resolveUserId();
  if (!(await hasCompletedOnboarding(userId))) {
    redirect("/onboarding");
  }
  const summary = await loadHomeSummary(userId);

  const drillTitle = summary?.nextRecommendedDrill?.title ?? "Run a baseline speaking rep";
  const skillFocus = summary?.milestone.nextSkillFocus ?? "Confidence";
  const streak = summary?.sessionStreak ?? 0;
  const level = summary?.levelProgress.level ?? 1;
  const levelTitle = summary?.levelProgress.levelTitle ?? "Rookie Speaker";

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-7 md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-brand-700 ring-1 ring-brand-100">
            Day {streak} streak
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
            Level {level} - {levelTitle}
          </span>
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-600">Today's focus</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
          Train like a leader people trust
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">{drillTitle}</h2>
        <p className="mt-3 max-w-2xl text-[15px] text-slate-600">
          Skill focus: <span className="font-medium text-slate-900">{skillFocus}</span> - One focused rep,
          honest feedback, one fix, retry. About 12 minutes.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="/session"
            className="inline-flex min-h-12 items-center rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px"
          >
            Start session
          </a>
          <a
            href="/baseline"
            className="inline-flex min-h-12 items-center rounded-lg border border-brand-200 bg-white px-5 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            Run baseline
          </a>
          <a
            href="/practice"
            className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
          >
            Pick a drill
          </a>
        </div>
      </section>

      <section className="mb-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Or jump to</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <a href="/practice" className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-200 hover:bg-brand-50/40">
            <p className="text-sm font-semibold text-slate-900">Practice</p>
            <p className="mt-1 text-xs text-slate-600">Skills, scenarios, and quests in one place.</p>
            <p className="mt-3 text-xs font-medium text-brand-600 group-hover:text-brand-700">Browse</p>
          </a>
          <a href="/dashboard" className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-200 hover:bg-brand-50/40">
            <p className="text-sm font-semibold text-slate-900">Progress</p>
            <p className="mt-1 text-xs text-slate-600">Trends, streak, weakest area, weekly review.</p>
            <p className="mt-3 text-xs font-medium text-brand-600 group-hover:text-brand-700">View</p>
          </a>
          <a href="/coach" className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-200 hover:bg-brand-50/40">
            <p className="text-sm font-semibold text-slate-900">Coach</p>
            <p className="mt-1 text-xs text-slate-600">Live AI coach plus your personalization profile.</p>
            <p className="mt-3 text-xs font-medium text-brand-600 group-hover:text-brand-700">Open</p>
          </a>
        </div>
      </section>
    </>
  );
}
