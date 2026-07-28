'use client';

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Activity, LogOut, LayoutDashboard, User as UserIcon, Shield, Radio, Sparkles } from "lucide-react";

export function NavigationBar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#030718]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-white tracking-tight">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
            <Activity className="h-5 w-5" />
          </div>
          <span>Social<span className="text-indigo-400">Pulse</span></span>
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/accounts" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Accounts
              </Link>
              <Link href="/suggestions" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Suggestions
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-semibold text-indigo-400 flex items-center gap-1 px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/50 rounded-lg">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link href="/profile" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 border border-slate-800 px-3 py-1.5 rounded-lg bg-slate-900"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
