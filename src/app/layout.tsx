import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Social Pulse",
  description:
    "Connect YouTube, Instagram, Facebook & TikTok. Extract video reach patterns and generate AI titles, hooks, hashtags & calendars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="social-pulse-theme"
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
