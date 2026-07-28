import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { NavigationBar } from "@/components/navigation-bar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Social Pulse — AI Powered Video Reach & Content Intelligence",
  description: "Connect YouTube, Instagram, Facebook & TikTok. Extract video reach patterns and generate AI titles, hooks, hashtags & calendars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#030718] text-slate-100 min-h-screen">
        <AuthProvider>
          <NavigationBar />
          <main>{children}</main>
          <Toaster position="top-right" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
