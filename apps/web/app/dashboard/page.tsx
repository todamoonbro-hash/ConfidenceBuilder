import { PageHeader } from "../../components/ui/page-header";

interface DashboardPageProps {
  searchParams?: {
    userId?: string;
  };
}

type TrendPoint = { label: string; value: number };

type DashboardPayload = {
  dashboard: {
    trends: {
      confidence: TrendPoint[];
      clarity: TrendPoint[];
      articulation: TrendPoint[];
      readingFluency: TrendPoint[];
      concision: TrendPoint[];
      executivePresence: TrendPoint[];
      mediaScore: TrendPoint[];
      listeningScore: TrendPoint[];
      xp: TrendPoint[];
    };
    sessionStreak: number;
    completedSessions: number;
    strongestArea: string;
    weakestArea: string;
    nextRecommendedDrill: { id: string; title: string; drillType: string } | null;
    levelProgress: { level: number; levelTitle: string; overallXp: number; nextLevelXp: number };
    milestone: {
      nextMilestone: string;
      nextSkillFocus: string;
      unlockedFeatures: string[];
      lockedFeatures: string[];
    };
    badgeProgress: { unlocked: number; total: number };
    questProgress: { title: string; completedSteps: number; totalSteps: number } | null;
    weeklyReview: {
      whatImproved: string;
      stillNeedsWork: string;
      oneFocusForNextWeek: string;
      nextQuestRecommendation: string;
      nextBossChallengeRecommendation: string;
    };
  };
};

async function loadDashboardData(userId: string) {
  try {
    const response = await fetch(`http://localhost:4000/v1/dashboard/${userId}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as DashboardPayload;
  } catch {
    return null;
  }
}

function TrendChart({ title, points }: { title: string; points: TrendPoint[] }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <div className="mt-3 flex items-end gap-1">
        {points.length === 0 ? <p className="text-xs text-slate-500">No data yet.</p> : null}
        {points.map((point) => (
          <div key={`${title}_${point.label}`} className="flex w-full flex-col items-center">
            <div className="h-20 w-full rounded-sm bg-slate-100">
              <div className="w-full rounded-sm bg-slate-800" style={{ height: `${Math.max(4, point.value)}%` }} />
            </div>
            <span className="mt-1 text-[10px] text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const userId = searchParams?.userId ?? "user_001";
  const data = await loadDashboardData(userId);
  const dashboard = data?.dashboard;

  if (!dashboard) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Track your speaking performance and progression." kicker="Progress" />
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Dashboard data is temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800">You can still complete a session and return here to view updated trends.</p>
          <a href="/session" className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Start session</a>
        </section>
      </>
    );
  }

  const xpToNext = Math.max(0, dashboard.levelProgress.nextLevelXp - dashboard.levelProgress.overallXp);
  const progressPct = Math.min(100, Math.round((dashboard.levelProgress.overallXp / Math.max(1, dashboard.levelProgress.nextLevelXp)) * 100));

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A concise view of momentum, weaknesses, and the single best next rep." kicker="Progress" />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Today&apos;s next action</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{dashboard.nextRecommendedDrill?.title ?? "Run a baseline speaking rep"}</h2>
          <p className="mt-1 text-sm text-slate-600">Focus: {dashboard.milestone.nextSkillFocus}</p>
          <a href="/session" className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Start focused session</a>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Current level</p>
          <p className="mt-1 text-xl font-semibold">L{dashboard.levelProgress.level} · {dashboard.levelProgress.levelTitle}</p>
          <p className="mt-1 text-sm text-slate-600">{xpToNext} XP to next level</p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Progress to next level</span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-slate-900" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <p><strong>Streak:</strong> {dashboard.sessionStreak} days</p>
          <p><strong>Strongest:</strong> {dashboard.strongestArea}</p>
          <p><strong>Needs work:</strong> {dashboard.weakestArea}</p>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TrendChart title="Confidence" points={dashboard.trends.confidence} />
        <TrendChart title="Clarity" points={dashboard.trends.clarity} />
        <TrendChart title="Executive presence" points={dashboard.trends.executivePresence} />
        <TrendChart title="Articulation" points={dashboard.trends.articulation} />
        <TrendChart title="Listening" points={dashboard.trends.listeningScore} />
        <TrendChart title="XP" points={dashboard.trends.xp} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Quest and milestone</h2>
          <p className="mt-2"><strong>Milestone:</strong> {dashboard.milestone.nextMilestone}</p>
          <p className="mt-1"><strong>Quest:</strong> {dashboard.questProgress ? `${dashboard.questProgress.title} (${dashboard.questProgress.completedSteps}/${dashboard.questProgress.totalSteps})` : "No active quest"}</p>
          <p className="mt-1"><strong>Badges:</strong> {dashboard.badgeProgress.unlocked}/{dashboard.badgeProgress.total}</p>
          <a href="/quests" className="mt-3 inline-flex rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700">Open quests</a>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Weekly review</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{dashboard.weeklyReview.whatImproved}</li>
            <li>{dashboard.weeklyReview.stillNeedsWork}</li>
            <li>{dashboard.weeklyReview.oneFocusForNextWeek}</li>
          </ul>
        </article>
      </section>
    </>
  );
}
