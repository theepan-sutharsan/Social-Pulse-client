"use client";

import * as React from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => undefined;

const themeOptions = [
  { value: "system", label: "Default", description: "Use device preference", icon: Monitor },
  { value: "dark", label: "Dark", description: "Dark appearance", icon: Moon },
  { value: "light", label: "Light", description: "Light appearance", icon: Sun },
] as const;

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"];
};

export function ThemeToggle({ compact = false, className, side = "bottom" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const hydrated = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const activeTheme = hydrated && themeOptions.some((option) => option.value === theme) ? theme : "system";
  const current = themeOptions.find((option) => option.value === activeTheme) ?? themeOptions[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "default"}
          className={cn(!compact && "w-full justify-between", className)}
          aria-label={`Appearance: ${current.label}`}
          title={compact ? `Appearance: ${current.label}` : undefined}
        >
          <span className={cn("flex min-w-0 items-center gap-2", compact && "sr-only")}>
            <CurrentIcon className="size-4" aria-hidden="true" />
            <span className="truncate">{current.label}</span>
          </span>
          {compact ? <CurrentIcon className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side} className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={activeTheme} onValueChange={setTheme}>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const selected = activeTheme === option.value;

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-3 py-2.5 pl-2 pr-2 [&>span:first-child]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{option.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                </span>
                <Check className={cn("size-4 text-primary", !selected && "opacity-0")} aria-hidden="true" />
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
