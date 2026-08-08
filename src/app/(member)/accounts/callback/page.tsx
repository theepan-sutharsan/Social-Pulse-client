'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthenticatedRoute } from "@/components/auth-guard";
import { oauthCallbackApi } from "@/services/accounts";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function OAuthCallbackContent() {
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
      <div className="mx-auto my-16 max-w-md px-4">
        <Card className="bg-slate-900 text-center">
          {status === 'processing' && (
            <>
              <CardHeader className="items-center pb-3">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-800 bg-indigo-950">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                </div>
                <CardTitle>Connecting your Meta Account...</CardTitle>
                <CardDescription className="text-xs leading-5">
                  Exchanging credentials and verifying permissions with Meta Graph API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" />
                </div>
              </CardContent>
            </>
          )}

          {status === 'success' && (
            <CardHeader className="items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-800/50 bg-emerald-950/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <CardTitle>Account Connected!</CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Redirecting to your connected accounts manager...
              </CardDescription>
            </CardHeader>
          )}

          {status === 'error' && (
            <>
              <CardHeader className="items-center pb-3">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-rose-800/50 bg-rose-950/40">
                  <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <CardTitle>Connection Failed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-xl border border-rose-800/50 bg-rose-950/40 p-3 text-xs leading-5 text-rose-300">{errorMsg}</p>
                <Button onClick={() => router.push('/accounts/new')} size="sm">Try Again</Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto my-16 max-w-md px-4">
        <Card className="bg-slate-900 text-center">
          <CardHeader className="items-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
