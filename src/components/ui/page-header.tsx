import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, eyebrow, icon, actions, className }: {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-800 bg-indigo-950 text-indigo-400">{icon}</div>}
        <div className="space-y-1">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{eyebrow}</p>}
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
