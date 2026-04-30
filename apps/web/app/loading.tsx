export default function GlobalLoading() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-6 w-48 rounded bg-slate-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
          </div>
          <div className="mt-6 h-10 w-32 rounded bg-slate-200" />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="h-4 w-3/5 rounded bg-slate-100" />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">Loading your academy workspace...</p>
    </div>
  );
}
