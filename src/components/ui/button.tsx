import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500",
  secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
  outline: "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white",
  ghost: "text-slate-400 hover:bg-slate-800 hover:text-white",
  destructive: "bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-950/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-12 rounded-xl px-6",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
