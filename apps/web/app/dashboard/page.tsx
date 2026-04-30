import { PageHeader } from "../../components/ui/page-header";

interface DashboardPageProps {
  searchParams?: Promise<{
    userId?: string;
  }>;
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
  const isEmpty = points.length === 0;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {isEmpty ? (
        <div className="mt-4 flex h-24 items-center justify-center rounded-lg bg-slate-50">
          <p className="text-xs text-slate-500">Complete sessions to see trends</p>
        </div>
      ) : (
        <div className="mt-4 flex items-end gap-1 h-24">
          {points.map((point) => (
            <div key={`${title}_${point.label}`} className="flex w-full flex-col items-center gap-1">
              <div className="relative h-full w-full rounded-sm bg-slate-100 overflow-hidden group">
                <div 
                  className="w-full rounded-sm bg-gradient-to-t from-slate-900 to-slate-700 transition-all" 
                  style={{ height: `${Math.max(5, point.value)}%` }}
                  title={`${point.label}: ${point.value}%`}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-600">{point.label}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const userId = params?.userId ?? "user_001";
  const data = await loadDashboardData(userId);
  const dashboard = data?.dashboard;

  if (!dashboard) {
    return (
      <>
        <PageHeader 
          title="Dashboard" 
          subtitle="Track speaking performance, progression, and next best steps." 
          kicker="Progress" 
        />
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <span className="text-sm font-bold text-amber-600">i</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Dashboard data unavailable</h3>
              <p className="mt-1 text-sm text-amber-800">Complete a session to generate your first performance snapshot.</p>
              <a href="/session" className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">Start your first session</a>
            </div>
          </div>
        </section>
      </>
    );
  }

  const xpToNext = Math.max(0, dashboard.levelProgress.nextLevelXp - dashboard.levelProgress.overallXp);
  const progressPct = Math.min(100, Math.round((dashboard.levelProgress.overallXp / Math.max(1, dashboard.levelProgress.nextLevelXp)) * 100));

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        subtitle="Your speaking evolution. Focus on the weakest area to accelerate growth." 
        kicker="Progress" 
      />

      {/* Top action card + level card */}
      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-blue-50 to-slate-50 p-6 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Today's focus</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">{dashboard.nextRecommendedDrill?.title ?? "Run a baseline speaking rep"}</h2>
          <p className="mt-2 text-sm text-slate-600">Skill focus: <span className="font-medium text-slate-900">{dashboard.milestone.nextSkillFocus}</span></p>
          <a href="/session" className="mt-4 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 transition-colors">Start session →</a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Level</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">L{dashboard.levelProgress.level}</p>
          <p className="text-sm text-slate-600 mt-1">{dashboard.levelProgress.levelTitle}</p>
          <p className="mt-3 text-xs text-slate-500">{xpToNext} XP to level up</p>
        </article>
      </section>

      {/* Progress bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-900">Progression</p>
          <p className="text-sm font-medium text-slate-600">{progressPct}%</p>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      {/* Key stats */}
      <section className="grid gap-3 md:grid-cols-3 mb-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Streak</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.sessionStreak}</p>
          <p className="text-xs text-slate-600 mt-1">consecutive days</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Strongest</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.strongestArea}</p>
          <p className="text-xs text-slate-600 mt-1">keep building</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm border-orange-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Needs work</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.weakestArea}</p>
          <p className="text-xs text-slate-600 mt-1">next focus area</p>
        </article>
      </section>

      {/* Trends title */}
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Performance trends</h3>

      {/* Trend charts - organized in 2 rows */}
      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <TrendChart title="Confidence" points={dashboard.trends.confidence} />
        <TrendChart title="Clarity" points={dashboard.trends.clarity} />
        <TrendChart title="Executive Presence" points={dashboard.trends.executivePresence} />
        <TrendChart title="Articulation" points={dashboard.trends.articulation} />
        <TrendChart title="Listening" points={dashboard.trends.listeningScore} />
        <TrendChart title="Progress XP" points={dashboard.trends.xp} />
      </section>

      {/* Bottom cards */}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Active quest</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="text-xs uppercase tracking-wide text-slate-500">Milestone:</span> {dashboard.milestone.nextMilestone}</p>
            <p><span className="text-xs uppercase tracking-wide text-slate-500">Quest:</span> {dashboard.questProgress ? `${dashboard.questProgress.title} (${dashboard.questProgress.completedSteps}/${dashboard.questProgress.totalSteps})` : "No active quest"}</p>
            <p><span className="text-xs uppercase tracking-wide text-slate-500">Badges:</span> {dashboard.badgeProgress.unlocked}/{dashboard.badgeProgress.total} unlocked</p>
          </div>
          <a href="/quests" className="mt-3 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">View all quests →</a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">This week</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><span className="text-xs uppercase tracking-wide text-slate-500 block">Improved:</span> {dashboard.weeklyReview.whatImproved}</li>
            <li><span className="text-xs uppercase tracking-wide text-slate-500 block">Needs work:</span> {dashboard.weeklyReview.stillNeedsWork}</li>
            <li><span className="text-xs uppercase tracking-wide text-slate-500 block">Next focus:</span> {dashboard.weeklyReview.oneFocusForNextWeek}</li>
          </ul>
        </article>
      </section>
    </>
  );
}
