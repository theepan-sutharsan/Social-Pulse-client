'use client';

import Link from "next/link";
import { useState } from "react";
import { isAxiosError } from "axios";
import { Activity, ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordResetApi } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [developmentResetUrl, setDevelopmentResetUrl] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await requestPasswordResetApi(email);
      setDevelopmentResetUrl(response.reset_url || "");
      setSubmitted(true);
    } catch (error: unknown) {
      const message = isAxiosError<{ errors?: string[]; error?: string }>(error)
        ? error.response?.data?.errors?.[0] || error.response?.data?.error
        : undefined;
      toast.error(message || "We could not process that request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl">
        <CardHeader className="items-center border-b border-border px-6 pb-6 pt-8 text-center sm:px-8">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Activity className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black">Reset your password</CardTitle>
          <CardDescription className="max-w-sm text-xs">
            Enter your account email and we&apos;ll send you a secure password reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-6 sm:px-8">
          {submitted ? (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <div className="space-y-2">
                <h2 className="font-bold text-foreground">Check your email</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  If an account exists for <span className="font-semibold text-foreground">{email}</span>, you&apos;ll receive reset instructions shortly.
                </p>
              </div>
              {developmentResetUrl && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">Development reset link</p>
                  <Link href={developmentResetUrl} className="mt-1 block break-all underline underline-offset-2">
                    Open reset page
                  </Link>
                </div>
              )}
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <ArrowLeft className="size-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="creator@socialpulse.test"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending Link..." : "Send Reset Link"}
                {!loading && <Send className="h-4 w-4" />}
              </Button>

              <Link href="/auth/login" className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3.5" /> Back to sign in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
