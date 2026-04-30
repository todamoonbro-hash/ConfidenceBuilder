export interface PlaceholderCardProps {
  title: string;
  description: string;
  icon?: "inbox" | "chart" | "zap" | "target" | "star";
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondary?: { label: string; href: string };
  variant?: "default" | "success" | "info" | "warning";
}

const iconMap = {
  inbox: "IN",
  chart: "CH",
  zap: "GO",
  target: "TG",
  star: "ST"
};

const variantStyles = {
  default: "border-slate-200 bg-white",
  success: "border-emerald-200 bg-emerald-50",
  info: "border-sky-200 bg-sky-50",
  warning: "border-amber-200 bg-amber-50"
};

export function PlaceholderCard({
  title,
  description,
  icon,
  ctaLabel,
  ctaHref,
  ctaSecondary,
  variant = "default"
}: PlaceholderCardProps) {
  return (
    <section className={`rounded-lg border p-6 shadow-sm ${variantStyles[variant]}`}>
      {icon ? (
        <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-700 shadow-sm">{iconMap[icon]}</div>
      ) : null}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      {(ctaLabel || ctaSecondary) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ctaLabel && ctaHref && (
            <a href={ctaHref} className="inline-flex min-h-10 items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              {ctaLabel}
            </a>
          )}
          {ctaSecondary && (
            <a href={ctaSecondary.href} className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {ctaSecondary.label}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
