"use client";

import { useEffect, useState } from "react";
import { Bell, BookOpen, Clock, LogOut, Moon, Pause, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TRANSLATIONS = [
  { id: "131", label: "The Clear Quran (Mustafa Khattab)" },
  { id: "85", label: "Sahih International" },
  { id: "20", label: "Pickthall" },
];

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon size={15} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ backgroundColor: checked ? "var(--primary)" : "#d1d5db" }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function TimeInput({
  value,
  onChange,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  testId: string;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border-0 bg-secondary px-3 py-1.5 text-sm font-medium text-primary outline-none ring-0 focus:ring-2 focus:ring-ring cursor-pointer text-center"
      style={{ minWidth: "5.5rem" }}
      data-testid={testId}
    />
  );
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [morningTime, setMorningTime] = useState("08:00");
  const [eveningTime, setEveningTime] = useState("21:00");
  const [translationId, setTranslationId] = useState("131");
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.display_name) setDisplayName(d.display_name);
      })
      .catch(() => {});
  }, []);

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName.trim(),
        morning_time: morningTime,
        evening_time: eveningTime,
        translation_id: translationId,
        paused,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function enableNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen p-6 pb-28 bg-background">
      <div className="max-w-sm mx-auto flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your reminders and preferences
          </p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>How you appear on the home screen</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              icon={User}
              label="Your name"
              description="Used in the greeting"
            >
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ahmad"
                maxLength={80}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-ring text-right"
                style={{ maxWidth: "9rem" }}
                data-testid="settings-display-name"
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Reminders</CardTitle>
            <CardDescription>
              When to receive your daily notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              icon={Clock}
              label="Morning reminder"
              description="Daily ayah notification"
            >
              <TimeInput
                value={morningTime}
                onChange={setMorningTime}
                testId="settings-morning-time"
              />
            </SettingRow>
            <SettingRow
              icon={Moon}
              label="Evening reminder"
              description="Reflection prompt"
            >
              <TimeInput
                value={eveningTime}
                onChange={setEveningTime}
                testId="settings-evening-time"
              />
            </SettingRow>
            <SettingRow
              icon={Pause}
              label="Pause all notifications"
              description="Silence reminders temporarily"
            >
              <Toggle checked={paused} onChange={setPaused} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Reading */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Reading</CardTitle>
            <CardDescription>Quran translation preference</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow icon={BookOpen} label="Translation">
              <select
                value={translationId}
                onChange={(e) => setTranslationId(e.target.value)}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                style={{ maxWidth: "10rem" }}
                data-testid="settings-translation"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </SettingRow>
          </CardContent>
        </Card>

        {/* Notifications */}
        {notifPermission !== "granted" && (
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base">Push notifications</CardTitle>
              <CardDescription>
                {notifPermission === "denied"
                  ? "Notifications are blocked in your browser settings."
                  : "Enable browser push notifications to receive reminders."}
              </CardDescription>
            </CardHeader>
            {notifPermission !== "denied" && (
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={enableNotifications}
                  data-testid="enable-notifications-btn"
                >
                  <Bell size={15} />
                  Enable push notifications
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Save */}
        <Button
          size="lg"
          className="w-full"
          onClick={saveSettings}
          disabled={saving}
          data-testid="save-settings-btn"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
        </Button>

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={signOut}
          data-testid="sign-out-btn"
        >
          <LogOut size={15} />
          Sign out
        </Button>
      </div>
    </main>
  );
}
