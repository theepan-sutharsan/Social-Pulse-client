import Link from "next/link";
import { Activity } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Activity className="size-5" />
          </span>
          <span>
            Social<span className="text-primary">Pulse</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <ThemeToggle compact />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
