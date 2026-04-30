"use client";

import { usePathname } from "next/navigation";

export interface NavLinkProps {
  href: string;
  label: string;
  badge?: string;
}

export function NavLink({ href, label, badge }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <span>{label}</span>
      {badge ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{badge}</span> : null}
    </a>
  );
}
