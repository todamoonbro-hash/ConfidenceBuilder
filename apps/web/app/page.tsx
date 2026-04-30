import { PageHeader } from "../components/ui/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader
        kicker="Academy"
        title="Train like a leader people trust"
        subtitle="One focused speaking session daily builds the clarity, calm, and confidence that moves organizations."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today's focus</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">Start your daily session</h2>
              <p className="mt-2 text-sm text-slate-600">Record one speaking rep, get real feedback, apply one fix, and retry. Builds momentum.</p>
              <a href="/session" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Start session
              </a>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Smart path</p>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">
            {["Check your dashboard", "Record session", "Apply feedback"].map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Training Labs</h3>
          <p className="mt-1 text-xs text-slate-600">Deep-focus modules: articulation, reading, interviews, executive presence, and more.</p>
          <a href="/modules" className="mt-3 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600">
            Explore labs
          </a>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Professional Quests</h3>
          <p className="mt-1 text-xs text-slate-600">Multi-day challenge tracks with clear reps, checkpoints, and outcomes.</p>
          <a href="/quests" className="mt-3 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600">
            View quests
          </a>
        </article>
      </section>
    </>
  );
}
