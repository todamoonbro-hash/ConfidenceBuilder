"use client";

export default function GlobalError() {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <p className="text-sm font-semibold text-rose-900">Something went wrong while loading this view.</p>
      <p className="mt-1 text-sm text-rose-800">Return to Dashboard or Session to continue training.</p>
      <div className="mt-3 flex gap-2">
        <a href="/dashboard" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">Dashboard</a>
        <a href="/session" className="rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-900">Session</a>
      </div>
    </div>
  );
}
