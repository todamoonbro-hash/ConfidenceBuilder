import { PageHeader } from "../components/ui/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader
        kicker="Academy"
        title="Train like a leader people trust"
        subtitle="Use one focused session daily to sharpen message clarity, calm delivery, and decision-grade communication."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next action</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Complete today&apos;s guided session</h2>
          <p className="mt-2 text-sm text-slate-600">Warm up, record one speaking rep, and review one priority fix before moving to advanced drills.</p>
          <a href="/session" className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Start daily session</a>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fast path</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            <li>1. Review dashboard trend</li>
            <li>2. Run one speaking session</li>
            <li>3. Complete one module rep</li>
          </ul>
        </article>
      </section>
    </>
  );
}
