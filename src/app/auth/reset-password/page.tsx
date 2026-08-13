'use client';

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { resetPasswordApi } from "@/services/auth";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("This password reset link is missing or invalid.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(token, password);
      setCompleted(true);
      toast.success("Password updated successfully.");
    } catch (error: unknown) {
      const message = isAxiosError<{ errors?: string[]; error?: string }>(error)
        ? error.response?.data?.errors?.[0] || error.response?.data?.error
        : undefined;
      toast.error(message || "This reset link is invalid or has expired.");
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
          <CardTitle className="text-2xl font-black">Choose a new password</CardTitle>
          <CardDescription className="max-w-sm text-xs">
            Use at least 6 characters, then sign in with your new password.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-6 sm:px-8">
          {completed ? (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <div className="space-y-2">
                <h2 className="font-bold text-foreground">Password updated</h2>
                <p className="text-sm leading-6 text-muted-foreground">Your password has been changed. You can now sign in.</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Continue to sign in <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter the password again"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating Password..." : "Update Password"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[85vh] items-center justify-center text-sm text-muted-foreground">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
