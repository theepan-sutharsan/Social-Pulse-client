'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";
import { Activity, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { loginApi } from "@/services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginApi(email, password);
      login(res.access_token, res.user);
      toast.success("Welcome back to Social Pulse!");
      router.push(res.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error: unknown) {
      const message = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Login failed. Please check credentials.");
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
          <CardTitle className="text-2xl font-black">Welcome back</CardTitle>
          <CardDescription className="max-w-sm text-xs">
            Sign in to Social Pulse to access your analytics dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@socialpulse.test"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Your session is securely protected</span>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
