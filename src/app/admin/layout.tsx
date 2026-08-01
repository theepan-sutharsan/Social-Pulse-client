'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Shield, LayoutDashboard, Radio, Sparkles, Layers } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/accounts", label: "Connected Accounts", icon: Radio },
    { href: "/admin/tracked-channels", label: "Tracked Channels", icon: Layers },
    { href: "/admin/suggestions", label: "AI Suggestions", icon: Sparkles },
  ];

  return (
    <AuthenticatedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#030718] flex flex-col md:flex-row">
        {/* Admin Navigation */}
        <aside className="w-full md:w-64 bg-[#0e172a] border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-6 shrink-0">
          <div className="flex items-center gap-2 font-black text-base sm:text-lg text-white border-b border-slate-800/80 pb-3 sm:pb-4">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Admin Control</span>
          </div>

          <nav className="flex md:flex-col overflow-x-auto pb-1 md:pb-0 gap-1.5 sm:gap-2 text-xs font-semibold scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
}

