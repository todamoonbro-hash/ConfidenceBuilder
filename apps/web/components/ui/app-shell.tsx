import { NavLink } from "./nav-link";

export interface AppShellProps {
  children?: any;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-5 md:px-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">ConfidenceBuilder</p>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900 mt-1">Executive Speaking Academy</h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Calm repetition · Clear thinking · High-stakes delivery</p>
            </div>
            
            {/* Navigation - Organized by sections */}
            <nav className="flex flex-col gap-3 text-sm">
              {/* Primary actions */}
              <div className="flex flex-wrap gap-1">
                <NavLink href="/" label="Home" />
                <NavLink href="/session" label="Today's Session" badge="Daily" />
                <NavLink href="/dashboard" label="Progress" />
                <NavLink href="/coach" label="Coach" badge="AI" />
              </div>
              
              {/* Training modules */}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 text-xs text-slate-500 font-semibold">TRAINING:</span>
                <NavLink href="/modules" label="Labs" />
                <NavLink href="/modules" label="Articulation" />
                <NavLink href="/interview-prep" label="Interviews" badge="New" />
                <NavLink href="/executive-presence" label="Executive" badge="New" />
                <NavLink href="/sales-influence" label="Sales" badge="New" />
                <NavLink href="/difficult-conversations" label="Difficult Talk" badge="New" />
                <NavLink href="/networking" label="Networking" badge="New" />
              </div>
              
              {/* Game & progress */}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 text-xs text-slate-500 font-semibold">PROGRESS:</span>
                <NavLink href="/quests" label="Quests" />
                <NavLink href="/history" label="History" />
                <NavLink href="/settings" label="Settings" />
              </div>
            </nav>
          </header>
          
          {/* Main content */}
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
