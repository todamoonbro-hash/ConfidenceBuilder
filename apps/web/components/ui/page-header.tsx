export interface PageHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, subtitle, kicker = "Training", action }: PageHeaderProps) {
  return (
    <header className="mb-6 border-b border-slate-200 pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kicker}</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">{subtitle}</p>
        </div>
        {action && (
          <div className="shrink-0">
            <a 
              href={action.href}
              className="inline-flex min-h-10 items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              {action.label}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
