'use client';

import Link from "next/link";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Shield, Radio, Sparkles, Layers } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#030718] flex flex-col md:flex-row">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 bg-[#0e172a] border-r border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 font-black text-lg text-white border-b border-slate-800 pb-4">
            <Shield className="w-5 h-5 text-indigo-400" /> Admin Control
          </div>

          <nav className="space-y-2 text-xs font-semibold">
            <Link href="/admin/dashboard" className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Overview Dashboard
            </Link>
            <Link href="/admin/accounts" className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              All Connected Accounts
            </Link>
            <Link href="/admin/tracked-channels" className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Tracked Channels (CSV)
            </Link>
            <Link href="/admin/suggestions" className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              All AI Suggestions
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
}
