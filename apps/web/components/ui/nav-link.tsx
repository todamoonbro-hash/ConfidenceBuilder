export interface NavLinkProps {
  href: string;
  label: string;
  badge?: string;
}

export function NavLink({ href, label, badge }: NavLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white hover:text-slate-900"
    >
      <span>{label}</span>
      {badge ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">{badge}</span> : null}
    </a>
  );
}
