export interface PageHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, subtitle, kicker = "Training", action }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-slate-200 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{kicker}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        {action && (
          <div className="shrink-0">
            <a
              href={action.href}
              className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px"
            >
              {action.label}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
