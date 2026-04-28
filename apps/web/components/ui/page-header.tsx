export interface PageHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
}

export function PageHeader({ title, subtitle, kicker = "Training" }: PageHeaderProps) {
  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </header>
  );
}
