'use client';

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Activity,
  Bell,
  BrainCircuit,
  LayoutDashboard,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  Radio,
  Shield,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
  X,
} from "lucide-react";

type NavIcon = ComponentType<{ className?: string }>;
type NavItem = { href: string; label: string; icon: NavIcon };
type NavGroup = { label: string; items: NavItem[] };

const workspaceGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/channels", label: "Channels", icon: Radio },
      { href: "/competitors", label: "Competitors", icon: UsersRound },
    ],
  },
  {
    label: "Content intelligence",
    items: [
      { href: "/accounts", label: "Connected accounts", icon: Library },
      { href: "/suggestions", label: "AI suggestions", icon: Lightbulb },
      { href: "/video-analysis", label: "Video analyzer", icon: Video },
      { href: "/yt-channel-analysis", label: "YouTube analyzer", icon: YouTubeIcon },
      { href: "/youtube-audience-intelligence", label: "Audience intelligence", icon: BrainCircuit },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const adminGroup: NavGroup = {
  label: "Administration",
  items: [
    { href: "/admin/dashboard", label: "Admin overview", icon: Shield },
    { href: "/admin/accounts", label: "All accounts", icon: Radio },
    { href: "/admin/tracked-channels", label: "Tracked channels", icon: Library },
    { href: "/admin/suggestions", label: "All suggestions", icon: Sparkles },
  ],
};

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const groups = isAdmin ? [...workspaceGroups, adminGroup] : workspaceGroups;
  const initials = (user?.full_name || user?.email || "SP")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/30">
            <Activity className="h-5 w-5" />
          </span>
          <span className="truncate text-xl font-black tracking-tight text-sidebar-foreground">
            Social<span className="text-primary">Pulse</span>
          </span>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-thin" aria-label="Application navigation">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !active && "text-primary")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl border border-sidebar-border bg-card p-3 shadow-sm">
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
              {initials || "SP"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-card-foreground">{user?.full_name || "Social Pulse user"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <ThemeToggle side="top" className="mb-2" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:text-destructive"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const allItems = [...workspaceGroups.flatMap((group) => group.items), ...adminGroup.items];
  const currentItem = allItems
    .filter((item) => isRouteActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Button ref={menuButtonRef} variant="outline" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Social Pulse</p>
            <p className="truncate text-sm font-bold text-foreground">{currentItem?.label || "Workspace"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            tabIndex={-1}
            aria-label="Mobile navigation"
            className="absolute inset-y-0 left-0 w-[min(20rem,88vw)] border-r border-sidebar-border shadow-2xl outline-none"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-5 z-10"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-h-screen min-w-0 lg:pl-72">{children}</main>
    </div>
  );
}
