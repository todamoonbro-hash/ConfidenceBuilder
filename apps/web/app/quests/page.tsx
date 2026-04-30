import { PageHeader } from "../../components/ui/page-header";
import { DEFAULT_USER_ID, resolveUserId } from "../../lib/user";

interface QuestsPageProps {
  searchParams?: Promise<{
    userId?: string;
  }>;
}

type QuestStatus = "active" | "completed" | "paused" | "locked";

type QuestItem = {
  quest: {
    id: string;
    title: string;
    description: string;
    minLevel: number;
    targetSkill: string;
    steps: Array<{ id: string }>;
  };
  status: QuestStatus;
  progress?: {
    currentStepIndex: number;
    completedStepIds: string[];
  };
};

async function loadQuests(userId: string): Promise<QuestItem[]> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/quests/${encodeURIComponent(userId)}`, {
      cache: "no-store"
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { quests?: QuestItem[] };
    return payload.quests ?? [];
  } catch {
    return [];
  }
}

function statusBadge(status: QuestStatus) {
  if (status === "active") return { label: "Active", className: "bg-emerald-100 text-emerald-800" };
  if (status === "completed") return { label: "Completed", className: "bg-sky-100 text-sky-800" };
  if (status === "locked") return { label: "Locked", className: "bg-slate-200 text-slate-700" };
  return { label: "Available", className: "bg-amber-100 text-amber-800" };
}

export default async function QuestsPage({ searchParams }: QuestsPageProps) {
  const params = await searchParams;
  const userId = resolveUserId(params?.userId ?? DEFAULT_USER_ID);
  const quests = await loadQuests(userId);

  const recommendedQuest = quests.find((item) => item.status === "active") ?? quests.find((item) => item.status === "paused");

  return (
    <>
      <PageHeader
        kicker="Game layer"
        title="Professional challenges"
        subtitle="Multi-day quest tracks with clear reps, checkpoints, and measurable skill outcomes. Start one whenever you're ready."
      />

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">How quests work</h2>
        <p className="mt-2 text-sm text-slate-600">Pick a quest aligned with your goals. Complete daily speaking reps focused on that quest's theme. Each completed rep unlocks checkpoints and progress toward mastery.</p>
      </section>

      {recommendedQuest ? (
        <section className="mb-6 rounded-lg border border-brand-100 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Recommended now</p>
          <h2 className="mt-2 text-base font-semibold text-slate-900">{recommendedQuest.quest.title}</h2>
          <p className="mt-1 text-sm text-slate-700">{recommendedQuest.quest.description}</p>
        </section>
      ) : null}

      <section className="grid gap-5 md:grid-cols-3">
        {quests.map((item) => {
          const quest = item.quest;
          const isActive = item.status === "active";
          const isCompleted = item.status === "completed";
          const isLocked = item.status === "locked";
          const badge = statusBadge(item.status);
          const completedSteps = item.progress?.completedStepIds.length ?? 0;
          const totalSteps = quest.steps.length;

          return (
            <article
              key={quest.id}
              className={`rounded-lg border p-6 ${
                isActive
                  ? "border-brand-600 bg-brand-600 text-white"
                  : isLocked
                  ? "border-slate-200 bg-slate-50 opacity-60"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isActive ? "text-slate-300" : "text-slate-500"}`}>Target skill: {quest.targetSkill.replace(/_/g, " ")}</p>
                  <h3 className={`mt-1 text-lg font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>{quest.title}</h3>
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                </div>
              </div>

              <p className={`mb-4 line-clamp-3 text-sm ${isActive ? "text-slate-300" : "text-slate-600"}`}>{quest.description}</p>
              <p className={`mb-3 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>Progress: {completedSteps}/{totalSteps} steps</p>

              <form action="/quests/start" method="POST">
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="questId" value={quest.id} />
                <button
                  type="submit"
                  className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold ${
                    isActive
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : isLocked
                      ? "cursor-not-allowed bg-slate-300 text-slate-600"
                      : isCompleted
                      ? "bg-sky-700 text-white hover:bg-sky-800"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                  disabled={isLocked}
                >
                  {isActive ? "Continue active quest" : isLocked ? `Unlock at Level ${quest.minLevel}` : isCompleted ? "Replay quest" : "Start quest"}
                </button>
              </form>

              {isLocked ? <p className="mt-2 text-center text-xs text-slate-600">Unlock at Level {quest.minLevel}</p> : null}
            </article>
          );
        })}

        {quests.length === 0 ? (
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-6 md:col-span-3">
            <h3 className="text-sm font-semibold text-amber-900">Quest data unavailable</h3>
            <p className="mt-2 text-sm text-amber-800">Could not load quest status from the API. Make sure the API is running and reachable from the web app.</p>
          </article>
        ) : null}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Quest benefits</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Focused progression", "Clear daily reps build one specific skill."],
            ["Checkpoint rewards", "Complete milestones for badges and XP."],
            ["Measurable outcomes", "See skill improvements in your dashboard."]
          ].map(([title, description]) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">OK</div>
              <div>
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="text-xs text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
