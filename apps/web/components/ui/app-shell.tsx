import { NavLink } from "./nav-link";

export interface AppShellProps {
  children?: unknown;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-3 py-3 md:px-6 md:py-5">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
          <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">ConfidenceBuilder</p>
                <p className="text-lg font-semibold text-slate-900">Executive Speaking Academy</p>
                <p className="text-xs text-slate-500">Calm repetition. Clear thinking. High-stakes delivery.</p>
              </div>
              <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <NavLink href="/" label="Home" />
                <NavLink href="/dashboard" label="Dashboard" />
                <NavLink href="/coach" label="Coach" badge="New" />
                <NavLink href="/session" label="Session" badge="Daily" />
                <NavLink href="/modules" label="Modules" />
                <NavLink href="/sales-influence" label="Sales & Influence" badge="New" />
                <NavLink href="/interview-prep" label="Interview Prep" badge="New" />
                <NavLink href="/executive-presence" label="Executive Presence" badge="New" />
                <NavLink href="/difficult-conversations" label="Difficult Conversations" badge="New" />
                <NavLink href="/networking" label="Networking" badge="New" />
                <NavLink href="/quests" label="Quests" />
                <NavLink href="/history" label="History" />
                <NavLink href="/settings" label="Settings" />
              </nav>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
