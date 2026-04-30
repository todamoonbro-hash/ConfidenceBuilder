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
        {/* Primary CTA */}
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">today's focus</p>
              <h2 className="mt-2 text-lg md:text-xl font-semibold text-slate-900">Start your daily session</h2>
              <p className="mt-2 text-sm text-slate-600">Record one speaking rep, get real feedback, apply one fix, and retry. Builds momentum.</p>
              <a href="/session" className="mt-4 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 transition-colors">
                Start session →
              </a>
            </div>
          </div>
        </article>

        {/* Quick stats */}
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Smart path</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">1</span>
              <span>Check your dashboard</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">2</span>
              <span>Record session</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">3</span>
              <span>Apply feedback</span>
            </li>
          </ul>
        </article>
      </section>

      {/* Resources */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-slate-900">Training Labs</h3>
          <p className="mt-1 text-xs text-slate-600">Deep-focus modules: articulation, reading, interviews, executive presence, and more.</p>
          <a href="/modules" className="mt-3 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600">
            Explore labs →
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-slate-900">Professional Quests</h3>
          <p className="mt-1 text-xs text-slate-600">Multi-day challenge tracks with clear reps, checkpoints, and outcomes.</p>
          <a href="/quests" className="mt-3 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600">
            View quests →
          </a>
        </article>
      </section>
    </>
  );
}
