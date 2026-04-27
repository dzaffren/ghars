import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { RadialNav } from "@/components/RadialNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Ghars — Daily Quran Mission",
  description:
    "Plant daily seeds of Quranic action. One verse, one mission, one growing tree.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ghars",
  },
  openGraph: {
    title: "Ghars — Daily Quran Mission",
    description: "One verse. One mission. Watch your tree grow.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a2a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className="min-h-full bg-[#faf7f0] text-[#1a1a1a] antialiased"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        {children}
        <RadialNav />
      </body>
    </html>
  );
}
