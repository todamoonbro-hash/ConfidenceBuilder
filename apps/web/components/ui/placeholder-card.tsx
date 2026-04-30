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
  inbox: "📭",
  chart: "📊",
  zap: "⚡",
  target: "🎯",
  star: "✨"
};

const variantStyles = {
  default: "border-slate-200 bg-white",
  success: "border-green-200 bg-gradient-to-br from-green-50 to-white",
  info: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
  warning: "border-orange-200 bg-gradient-to-br from-orange-50 to-white"
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
    <section className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${variantStyles[variant]}`}>
      {icon && (
        <div className="mb-3 text-2xl">{iconMap[icon]}</div>
      )}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
      {(ctaLabel || ctaSecondary) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:bg-slate-950 transition-colors"
            >
              {ctaLabel} →
            </a>
          )}
          {ctaSecondary && (
            <a
              href={ctaSecondary.href}
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {ctaSecondary.label}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
