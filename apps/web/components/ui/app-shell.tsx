import { NavLink } from "./nav-link";

export interface AppShellProps {
  children?: any;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            <a href="/" className="block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">ConfidenceBuilder</p>
              <p className="text-base font-semibold leading-tight text-slate-950 md:text-lg">Speaking Academy</p>
            </a>
            <a href="/session" className="inline-flex min-h-10 items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px md:hidden">
              Start
            </a>
          </div>

          <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Primary navigation">
            <NavLink href="/" label="Today" />
            <NavLink href="/practice" label="Practice" />
            <NavLink href="/dashboard" label="Progress" />
            <NavLink href="/coach" label="Coach" />
            <details className="relative">
              <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 [&::-webkit-details-marker]:hidden">
                More
                <span aria-hidden="true">▾</span>
              </summary>
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <a href="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                <a href="/history" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">History</a>
                <a href="/onboarding" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit profile</a>
                <a href="/admin/scenario-studio" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin</a>
              </div>
            </details>
          </nav>

          <a href="/session" className="hidden min-h-10 items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px md:inline-flex">
            Start session
          </a>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
