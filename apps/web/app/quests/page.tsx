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

      {/* Quest intro */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
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
              className={`rounded-2xl border p-6 transition-all ${
                isRecommended 
                  ? "border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg hover:shadow-xl" 
                  : isLocked
                  ? "border-slate-200 bg-slate-50 opacity-60"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${isRecommended ? "text-slate-300" : "text-slate-500"}`}>
                    {quest.duration}
                  </p>
                  <h3 className={`mt-1 text-lg font-semibold ${isRecommended ? "text-white" : "text-slate-900"}`}>
                    {quest.title}
                  </h3>
                </div>
                {isRecommended && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-slate-900">
                      ★ Recommended
                    </span>
                  </div>
                )}
              </div>

              <p className={`text-sm font-medium mb-2 ${isRecommended ? "text-slate-200" : "text-slate-900"}`}>
                {quest.focus}
              </p>
              <p className={`text-sm line-clamp-2 mb-4 ${isRecommended ? "text-slate-300" : "text-slate-600"}`}>
                {quest.description}
              </p>

              <button
                type="button"
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isRecommended
                    ? "bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200"
                    : isLocked
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950"
                }`}
                disabled={isLocked}
              >
                {isRecommended 
                  ? "Start recommended quest" 
                  : isLocked 
                  ? "Unlock by leveling" 
                  : "Start quest"}
              </button>

              {isLocked && (
                <p className="mt-2 text-xs text-slate-600 text-center">Unlock at Level 3</p>
              )}
            </article>
          );
        })}
      </section>

      {/* Benefits */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Quest benefits</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Focused progression</p>
              <p className="text-xs text-slate-600">Clear daily reps build one specific skill.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Checkpoint rewards</p>
              <p className="text-xs text-slate-600">Complete milestones for badges and XP.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Measurable outcomes</p>
              <p className="text-xs text-slate-600">See skill improvements in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
