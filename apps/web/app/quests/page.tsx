import { PageHeader } from "../../components/ui/page-header";

const QUESTS = [
  { id: "q1", title: "Executive Clarity Sprint", duration: "5 days", focus: "clear decision framing", status: "recommended" },
  { id: "q2", title: "Media Pressure Week", duration: "7 days", focus: "calm under hostile questions", status: "locked" },
  { id: "q3", title: "Boardroom Presence", duration: "10 days", focus: "concise strategic answers", status: "available" }
] as const;

export default function QuestsPage() {
  return (
    <>
      <PageHeader
        kicker="Game layer"
        title="Quests"
        subtitle="Select one professional challenge track. Each quest has clear reps, checkpoints, and an end-state skill outcome."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {QUESTS.map((quest) => (
          <article key={quest.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{quest.duration}</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{quest.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Focus: {quest.focus}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">{quest.status}</p>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={quest.status === "locked"}
            >
              {quest.status === "recommended" ? "Start recommended quest" : quest.status === "locked" ? "Unlock by leveling" : "Start quest"}
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
