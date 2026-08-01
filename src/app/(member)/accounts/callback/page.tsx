'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthenticatedRoute } from "@/components/auth-guard";
import { oauthCallbackApi } from "@/services/accounts";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '';

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code provided in callback.');
      return;
    }

    let platform = 'instagram';
    if (state.includes('facebook')) {
      platform = 'facebook';
    } else if (state.includes('tiktok')) {
      platform = 'tiktok';
    }

    const processOAuth = async () => {
      try {
        const res = await oauthCallbackApi(platform, code);
        setStatus('success');
        toast.success(res.message || `${platform.toUpperCase()} account connected successfully!`);
        setTimeout(() => {
          router.push('/accounts');
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        const detail = err.response?.data?.error || err.message || "Failed to complete Meta authentication.";
        setErrorMsg(detail);
        toast.error(detail);
      }
    };

    processOAuth();
  }, [searchParams, router]);

  return (
    <AuthenticatedRoute>
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center space-y-4">
        {status === 'processing' && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Connecting your Meta Account...</h2>
            <p className="text-xs text-slate-400">Exchanging credentials and verifying permissions with Meta Graph API.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Account Connected!</h2>
            <p className="text-xs text-slate-300">Redirecting to your connected accounts manager...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">Connection Failed</h2>
            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 border border-rose-800/50 rounded-xl">{errorMsg}</p>
            <button
              onClick={() => router.push('/accounts/new')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
