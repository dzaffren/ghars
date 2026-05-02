"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/today", label: "Today", emoji: "📖" },
  { href: "/grove", label: "Grove", emoji: "🌳" },
  { href: "/journal", label: "Journal", emoji: "📝" },
  { href: "/settings", label: "Settings", emoji: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t flex justify-around items-center py-2 px-4"
        style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
        data-testid="bottom-nav"
      >
        {NAV_ITEMS.map(({ href, label, emoji }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-1 px-3"
              style={{
                color: active ? "var(--grove-green)" : "var(--text-muted)",
              }}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
