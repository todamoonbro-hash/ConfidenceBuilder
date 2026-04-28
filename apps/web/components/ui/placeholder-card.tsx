export interface PlaceholderCardProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function PlaceholderCard({ title, description, ctaLabel, ctaHref }: PlaceholderCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          className="mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {ctaLabel}
        </a>
      ) : null}
    </section>
  );
}
