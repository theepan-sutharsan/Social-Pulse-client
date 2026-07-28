'use client';

import { useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { updateProfileApi } from "@/services/auth";
import { User, Mail, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateProfileApi({ full_name: fullName, email, password: password || undefined });
      updateUser(res.user);
      toast.success("Profile updated successfully!");
      setPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="p-8 bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white">Member Profile</h1>
              <p className="text-xs text-slate-400 mt-1">Manage personal information and access credentials</p>
            </div>
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Role: {user?.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              {loading ? "Saving Changes..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
