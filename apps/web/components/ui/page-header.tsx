export interface PageHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, subtitle, kicker = "Training", action }: PageHeaderProps) {
  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{kicker}</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">{title}</h1>
          <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">{subtitle}</p>
        </div>
        {action && (
          <div className="flex-shrink-0">
            <a 
              href={action.href}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white whitespace-nowrap hover:bg-slate-800 active:bg-slate-950 transition-colors"
            >
              {action.label}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
