import { PageHeader } from "../../components/ui/page-header";

const QUESTS = [
  { id: "q1", title: "Executive Clarity Sprint", duration: "5 days", focus: "Clear decision framing", description: "Master concise, strategic communication under pressure.", status: "recommended" },
  { id: "q2", title: "Media Pressure Week", duration: "7 days", focus: "Calm under hostile questions", description: "Develop composure and message discipline with challenging scenarios.", status: "locked" },
  { id: "q3", title: "Boardroom Presence", duration: "10 days", focus: "Concise strategic answers", description: "Command attention with executive-grade communication.", status: "available" }
] as const;

export default function QuestsPage() {
  return (
    <>
      <PageHeader
        kicker="Game layer"
        title="Professional challenges"
        subtitle="Multi-day quest tracks with clear reps, checkpoints, and measurable skill outcomes. Start one whenever you're ready."
      />

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">How quests work</h2>
        <p className="mt-2 text-sm text-slate-600">Pick a quest aligned with your goals. Complete daily speaking reps focused on that quest's theme. Each completed rep unlocks checkpoints and progress toward mastery.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {QUESTS.map((quest) => {
          const isRecommended = quest.status === "recommended";
          const isLocked = quest.status === "locked";

          return (
            <article
              key={quest.id}
              className={`rounded-lg border p-6 ${
                isRecommended
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : isLocked
                  ? "border-slate-200 bg-slate-50 opacity-60"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isRecommended ? "text-slate-300" : "text-slate-500"}`}>{quest.duration}</p>
                  <h3 className={`mt-1 text-lg font-semibold ${isRecommended ? "text-white" : "text-slate-900"}`}>{quest.title}</h3>
                </div>
                {isRecommended ? (
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-900">Recommended</span>
                  </div>
                ) : null}
              </div>

              <p className={`mb-2 text-sm font-medium ${isRecommended ? "text-slate-200" : "text-slate-900"}`}>{quest.focus}</p>
              <p className={`mb-4 line-clamp-2 text-sm ${isRecommended ? "text-slate-300" : "text-slate-600"}`}>{quest.description}</p>

              <button
                type="button"
                className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold ${
                  isRecommended
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : isLocked
                    ? "cursor-not-allowed bg-slate-300 text-slate-600"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                disabled={isLocked}
              >
                {isRecommended ? "Start recommended quest" : isLocked ? "Unlock by leveling" : "Start quest"}
              </button>

              {isLocked ? <p className="mt-2 text-center text-xs text-slate-600">Unlock at Level 3</p> : null}
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
