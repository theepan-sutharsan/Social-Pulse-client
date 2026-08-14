'use client';

import { useState } from "react";
import { isAxiosError } from "axios";
import { Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/providers/auth-provider";
import { updateProfileApi } from "@/services/auth";

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
    } catch (error: unknown) {
      const message = isAxiosError<{ error?: string; errors?: string[] }>(error)
        ? error.response?.data?.errors?.[0] || error.response?.data?.error
        : undefined;
      toast.error(message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={['member', 'admin']}>
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Account Settings"
          title="Member Profile"
          description="Manage personal information and access credentials."
          icon={<User className="h-5 w-5" />}
          actions={(
            <Badge className="gap-1 uppercase">
              <Shield className="h-3.5 w-3.5" /> Role: {user?.role}
            </Badge>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Keep your account details current and secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">New Password</Label>
                  <span className="text-[11px] text-muted-foreground">Optional</span>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="border-t border-border pt-5">
                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  {loading ? "Saving Changes..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedRoute>
  );
}
