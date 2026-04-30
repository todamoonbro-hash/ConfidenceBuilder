import { NavLink } from "./nav-link";

export interface AppShellProps {
  children?: any;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ConfidenceBuilder</p>
              <h1 className="mt-0.5 text-lg font-semibold leading-tight text-slate-950 md:text-xl">Executive Speaking Academy</h1>
            </div>
            <a href="/session" className="inline-flex min-h-10 items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Start session
            </a>
          </div>

          <nav className="grid gap-2 text-sm" aria-label="Primary navigation">
            <div className="flex flex-wrap gap-1">
              <NavLink href="/" label="Home" />
              <NavLink href="/session" label="Session" badge="Daily" />
              <NavLink href="/dashboard" label="Progress" />
              <NavLink href="/coach" label="Coach" badge="AI" />
              <NavLink href="/settings" label="Settings" />
            </div>
            <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2">
              <NavLink href="/modules" label="Labs" />
              <NavLink href="/interview-prep" label="Interviews" />
              <NavLink href="/executive-presence" label="Executive" />
              <NavLink href="/sales-influence" label="Sales" />
              <NavLink href="/difficult-conversations" label="Difficult Talks" />
              <NavLink href="/networking" label="Networking" />
              <NavLink href="/quests" label="Quests" />
              <NavLink href="/history" label="History" />
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">{children}</main>
    </div>
  );
}
