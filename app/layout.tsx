import type { Metadata, Viewport } from "next";
import { Amiri } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ghars — Daily Quran Reflection",
  description: "Plant a tree for every honest reflection on an ayah.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ghars" },
};

export const viewport: Viewport = {
  themeColor: "#1a4731",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={amiri.variable}>
      <body>
        {children}
        <footer
          style={{
            textAlign: "center",
            padding: "16px",
            fontSize: "12px",
            color: "var(--text-muted, #888)",
          }}
        >
          <a
            href="/terms"
            style={{
              color: "inherit",
              textDecoration: "underline",
              marginRight: "16px",
            }}
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
        </footer>
      </body>
    </html>
  );
}
