import type { Metadata } from "next";
import { Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { AppBackground } from "@/components/app-background";
import { NavHeader } from "@/components/nav-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Heroes — Charity draws & subscriptions",
  description: "Stableford scores, transparent monthly draws, and directed giving — one subscription.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-transparent font-sans text-zinc-100 antialiased">
        <AppBackground />
        <NavHeader user={session ? { name: session.name, role: session.role } : null} />
        <div className="relative z-0 flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
