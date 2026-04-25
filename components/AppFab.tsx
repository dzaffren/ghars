"use client";

import { FlowerMenu } from "@/components/ui/flower-menu";
import { History, Home, LogOut } from "lucide-react";

async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}

const todayItems = [
  { icon: History, href: "/history", label: "History" },
  { icon: LogOut, onClick: signOut, label: "Sign out" },
];

const historyItems = [
  { icon: Home, href: "/today", label: "Today" },
  { icon: LogOut, onClick: signOut, label: "Sign out" },
];

export function AppFab({ variant }: { variant: "today" | "history" }) {
  // togglerSize=44 → container=132px, toggle centered at 66px from each container edge.
  // bottom/right: -28px → toggle center sits 38px from each viewport edge
  // (22px button radius + 16px standard FAB margin = 38px).
  // Items expand 90px outward: History goes LEFT to 128px from right,
  // Sign out goes UP to 128px from bottom — both comfortably within bounds.
  return (
    <div className="fixed z-50" style={{ bottom: "-20px", right: "-20px" }}>
      <FlowerMenu
        menuItems={variant === "today" ? todayItems : historyItems}
        backgroundColor="#2d6a4f"
        iconColor="white"
        togglerSize={44}
        startAngle={0}
        spreadAngle={90}
        animationDuration={350}
      />
    </div>
  );
}
