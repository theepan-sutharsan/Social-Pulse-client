import Link from "next/link";
import { Activity } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#030718]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
            <Activity className="h-5 w-5" />
          </span>
          <span>Social<span className="text-indigo-400">Pulse</span></span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
            Sign in
          </Link>
          <Link href="/auth/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
