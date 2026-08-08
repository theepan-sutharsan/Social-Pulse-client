import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "border-indigo-800 bg-indigo-950 text-indigo-400",
  secondary: "border-slate-700 bg-slate-800 text-slate-300",
  outline: "border-slate-700 bg-transparent text-slate-400",
  success: "border-emerald-800/50 bg-emerald-950/40 text-emerald-400",
  warning: "border-amber-800/50 bg-amber-950/40 text-amber-400",
  destructive: "border-rose-800/50 bg-rose-950/40 text-rose-400",
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", variants[variant], className)}
      {...props}
    />
  );
}
