import { PageHeader } from "../../components/ui/page-header";
import { resolveUserId } from "../../lib/user";

type TrainingProfile = {
  progression: { level: number; levelTitle: string; overallXp: number; streakDays: number; currentDifficulty: string } | null;
  badges: { badgeId: string }[];
  badgeCatalog: { id: string; label: string; description: string; icon?: string }[];
  nextUnlock: { id: string; label: string; description: string } | undefined;
  dailyMissions: { id: string; label: string; targetCount: number; completed: boolean }[];
  weeklyBossChallengePreview: { id: string; title: string; description: string; rewardXp: number } | undefined;
};

async function loadTrainingProfile(userId: string): Promise<TrainingProfile | null> {
  try {
    const base = process.env.API_BASE_URL ?? "http://localhost:4000";
    const res = await fetch(`${base}/v1/training/profile/${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TrainingProfile;
  } catch {
    return null;
  }
}

type AdaptivePlan = {
  drills: { id: string; title: string; skillBranch: string; estimatedMinutes: number }[];
  difficulty: string;
  dailyXpTarget: number;
};

async function loadAdaptivePlan(userId: string): Promise<AdaptivePlan | null> {
  try {
    const base = process.env.API_BASE_URL ?? "http://localhost:4000";
    const res = await fetch(`${base}/v1/training/adaptive-plan/${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; plan?: AdaptivePlan };
    return data.plan ?? null;
  } catch {
    return null;
  }
}

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
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/dashboard/${userId}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as DashboardPayload;
  } catch {
    return null;
  }
}

function TrendChart({ title, points }: { title: string; points: TrendPoint[] }) {
  const isEmpty = points.length === 0;
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {isEmpty ? (
        <div className="mt-4 flex h-24 items-center justify-center rounded-md bg-slate-50">
          <p className="text-xs text-slate-500">Complete sessions to see trends</p>
        </div>
      ) : (
        <div className="mt-4 flex h-24 items-end gap-1">
          {points.map((point) => (
            <div key={`${title}_${point.label}`} className="flex w-full flex-col items-center gap-1">
              <div className="relative h-full w-full overflow-hidden rounded-sm bg-slate-100">
                <div className="w-full rounded-sm bg-slate-900 transition-all" style={{ height: `${Math.max(5, point.value)}%` }} title={`${point.label}: ${point.value}%`} />
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
  const userId = resolveUserId(params?.userId);
  const [data, profile, adaptivePlan] = await Promise.all([
    loadDashboardData(userId),
    loadTrainingProfile(userId),
    loadAdaptivePlan(userId)
  ]);
  const dashboard = data?.dashboard;

  if (!dashboard) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Track speaking performance, progression, and next best steps." kicker="Progress" />
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-950">Dashboard data unavailable</h3>
          <p className="mt-1 text-sm text-amber-900">Complete a session to generate your first performance snapshot.</p>
          <a href="/session" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px">Start your first session</a>
        </section>
      </>
    );
  }

  const xpToNext = Math.max(0, dashboard.levelProgress.nextLevelXp - dashboard.levelProgress.overallXp);
  const progressPct = Math.min(100, Math.round((dashboard.levelProgress.overallXp / Math.max(1, dashboard.levelProgress.nextLevelXp)) * 100));

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your speaking evolution. Focus on the weakest area to accelerate growth." kicker="Progress" />

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-6 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today's focus</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">{dashboard.nextRecommendedDrill?.title ?? "Run a baseline speaking rep"}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Skill focus: <span className="font-medium text-slate-900">{dashboard.milestone.nextSkillFocus}</span>
          </p>
          <a href="/session" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px">Start session</a>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">L{dashboard.levelProgress.level}</p>
          <p className="mt-1 text-sm text-slate-600">{dashboard.levelProgress.levelTitle}</p>
          <p className="mt-3 text-xs text-slate-500">{xpToNext} XP to level up</p>
        </article>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">Progression</p>
          <p className="text-sm font-medium text-slate-600">{progressPct}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Streak</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.sessionStreak}</p>
          <p className="mt-1 text-xs text-slate-600">consecutive days</p>
        </article>

        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Strongest</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.strongestArea}</p>
          <p className="mt-1 text-xs text-slate-600">keep building</p>
        </article>

        <article className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Needs work</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.weakestArea}</p>
          <p className="mt-1 text-xs text-slate-600">next focus area</p>
        </article>
      </section>

      <h3 className="mb-4 text-lg font-semibold text-slate-900">Performance trends</h3>
      <section className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <TrendChart title="Confidence" points={dashboard.trends.confidence} />
        <TrendChart title="Clarity" points={dashboard.trends.clarity} />
        <TrendChart title="Executive Presence" points={dashboard.trends.executivePresence} />
        <TrendChart title="Articulation" points={dashboard.trends.articulation} />
        <TrendChart title="Listening" points={dashboard.trends.listeningScore} />
        <TrendChart title="Progress XP" points={dashboard.trends.xp} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Active quest</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="block text-xs uppercase tracking-wide text-slate-500">Milestone</span>{dashboard.milestone.nextMilestone}</p>
            <p><span className="block text-xs uppercase tracking-wide text-slate-500">Quest</span>{dashboard.questProgress ? `${dashboard.questProgress.title} (${dashboard.questProgress.completedSteps}/${dashboard.questProgress.totalSteps})` : "No active quest"}</p>
            <p><span className="block text-xs uppercase tracking-wide text-slate-500">Badges</span>{dashboard.badgeProgress.unlocked}/{dashboard.badgeProgress.total} unlocked</p>
          </div>
          <a href="/quests" className="mt-3 inline-flex min-h-10 items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">View all quests</a>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">This week</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><span className="block text-xs uppercase tracking-wide text-slate-500">Improved</span>{dashboard.weeklyReview.whatImproved}</li>
            <li><span className="block text-xs uppercase tracking-wide text-slate-500">Needs work</span>{dashboard.weeklyReview.stillNeedsWork}</li>
            <li><span className="block text-xs uppercase tracking-wide text-slate-500">Next focus</span>{dashboard.weeklyReview.oneFocusForNextWeek}</li>
          </ul>
        </article>
      </section>

      {adaptivePlan && adaptivePlan.drills.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Today's adaptive plan</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {adaptivePlan.drills.map((drill) => (
              <article key={drill.id} className="rounded-lg border border-brand-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{drill.skillBranch}</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">{drill.title}</h4>
                <p className="mt-1 text-xs text-slate-500">~{drill.estimatedMinutes} min · {adaptivePlan.difficulty} difficulty</p>
                <a href="/session" className="mt-3 inline-flex min-h-9 items-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Start</a>
              </article>
            ))}
          </div>
        </section>
      )}

      {profile && (
        <>
          {profile.dailyMissions.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Daily missions</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {profile.dailyMissions.map((mission) => (
                  <article key={mission.id} className={`rounded-lg border p-4 ${mission.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 text-lg ${mission.completed ? "text-emerald-600" : "text-slate-400"}`}>{mission.completed ? "✓" : "○"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{mission.label}</p>
                        <p className="mt-1 text-xs text-slate-500">Target: {mission.targetCount}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {profile.weeklyBossChallengePreview && (
            <section className="mt-6">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Weekly boss challenge</h3>
              <article className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">This week</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">{profile.weeklyBossChallengePreview.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{profile.weeklyBossChallengePreview.description}</p>
                <p className="mt-3 text-sm font-medium text-purple-700">+{profile.weeklyBossChallengePreview.rewardXp} XP on completion</p>
                <a href="/session" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">Accept challenge</a>
              </article>
            </section>
          )}

          {profile.nextUnlock && (
            <section className="mt-6">
              <article className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next badge unlock</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">{profile.nextUnlock.label}</h4>
                <p className="mt-1 text-xs text-slate-600">{profile.nextUnlock.description}</p>
              </article>
            </section>
          )}
        </>
      )}
    </>
  );
}
