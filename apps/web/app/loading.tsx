export default function GlobalLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-24 rounded bg-slate-200"></div>
        <div className="mt-4 h-8 w-64 rounded bg-slate-200"></div>
        <div className="mt-3 h-4 w-full rounded bg-slate-100"></div>
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="h-4 w-32 rounded bg-slate-200"></div>
          <div className="mt-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-slate-100"></div>
            <div className="h-4 w-3/4 rounded bg-slate-100"></div>
          </div>
          <div className="mt-6 h-10 w-32 rounded bg-slate-200"></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-200"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-slate-100"></div>
            <div className="h-4 w-4/5 rounded bg-slate-100"></div>
            <div className="h-4 w-3/5 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-600">Loading your academy workspace…</p>
        <div className="mt-2 flex justify-center gap-1">
          <div className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-pulse"></div>
          <div className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-pulse animation-delay-200"></div>
          <div className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-pulse animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
