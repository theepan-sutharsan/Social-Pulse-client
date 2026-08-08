'use client';

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Activity, LogOut, LayoutDashboard, User as UserIcon, Shield, Radio, Sparkles, Menu, X, Video, Youtube } from "lucide-react";

export function NavigationBar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#030718]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2 font-black text-xl text-white tracking-tight shrink-0">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
            <Activity className="h-5 w-5" />
          </div>
          <span>Social<span className="text-indigo-400">Pulse</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/channels" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Radio className="w-4 h-4" /> Channels
              </Link>
              <Link href="/competitors" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Sparkles className="w-4 h-4" /> Competitors
              </Link>
              <Link href="/accounts" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Radio className="w-4 h-4 text-indigo-400" /> Accounts
              </Link>
              <Link href="/suggestions" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Sparkles className="w-4 h-4" /> AI Suggestions
              </Link>
              <Link href="/video-analysis" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Video className="w-4 h-4 text-indigo-400" /> Video Analyzer
              </Link>
              <Link href="/yt-channel-analysis" className="text-sm font-medium text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel Analyzer
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-semibold text-indigo-400 flex items-center gap-1 px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/50 rounded-lg hover:bg-indigo-900/60 transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link href="/profile" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 border border-slate-800 px-3 py-1.5 rounded-lg bg-slate-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#060c24] px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
                Signed in as <span className="text-indigo-400 font-bold">{user?.full_name || user?.email}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Dashboard
              </Link>
              <Link
                href="/channels"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Radio className="w-4 h-4 text-indigo-400" /> Channels & Analytics
              </Link>
              <Link
                href="/competitors"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Competitors
              </Link>
              <Link
                href="/accounts"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Radio className="w-4 h-4 text-indigo-400" /> Connected Accounts
              </Link>
              <Link
                href="/suggestions"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> AI Suggestions
              </Link>
              <Link
                href="/video-analysis"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4 text-indigo-400" /> Video Analyzer
              </Link>
              <Link
                href="/yt-channel-analysis"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-950/40 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel Analyzer
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 rounded-lg"
                >
                  <Shield className="w-4 h-4 text-indigo-400" /> Admin Control
                </Link>
              )}
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" /> Account Profile
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu();
                  logout();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/30 mt-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-1">
              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="flex justify-center items-center px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={closeMobileMenu}
                className="flex justify-center items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

