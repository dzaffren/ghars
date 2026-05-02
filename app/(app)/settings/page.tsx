"use client";

import { useEffect, useState } from "react";
import { Bell, BookOpen, Clock, LogOut, Moon, Pause, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(45,106,79,0.08)" }}
        >
          <Icon size={15} style={{ color: "var(--grove-green-light)" }} />
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-medium leading-tight"
            style={{ color: "#1a3a2a" }}
          >
            {label}
          </p>
          {description && (
            <p
              className="text-xs mt-0.5 leading-tight"
              style={{ color: "var(--text-muted)" }}
            >
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
      className="relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: checked ? "var(--grove-green-light)" : "#d1d5db",
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--grove-green-light)",
      }}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
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
      className="rounded-xl border-0 px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 cursor-pointer text-center transition-shadow"
      style={{
        backgroundColor: "rgba(45,106,79,0.06)",
        color: "var(--grove-green)",
        minWidth: "5.5rem",
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--grove-green-light)",
      }}
      data-testid={testId}
    />
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

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

  const sections = [
    "profile",
    "reminders",
    "reading",
    ...(notifPermission !== "granted" ? ["notifications"] : []),
  ];

  return (
    <main
      className="min-h-screen pb-28"
      style={{ backgroundColor: "var(--sand)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-4 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(245,240,232,0.9)" }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#1a3a2a" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Preferences & reminders
        </p>
      </div>

      <div className="px-5 flex flex-col gap-4 max-w-sm mx-auto">
        {/* Profile */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card
            className="border-0 shadow-sm"
            style={{ backgroundColor: "#fffcf7", borderRadius: "1rem" }}
          >
            <CardHeader className="pb-0 pt-4 px-4">
              <CardTitle
                className="text-sm font-semibold"
                style={{ color: "var(--grove-green)" }}
              >
                Profile
              </CardTitle>
              <CardDescription className="text-xs">
                How you appear on the home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-2">
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
                  className="rounded-xl border border-transparent px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 text-right transition-shadow"
                  style={{
                    backgroundColor: "rgba(45,106,79,0.06)",
                    color: "var(--grove-green)",
                    maxWidth: "9rem",
                  }}
                  data-testid="settings-display-name"
                />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reminders */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card
            className="border-0 shadow-sm"
            style={{ backgroundColor: "#fffcf7", borderRadius: "1rem" }}
          >
            <CardHeader className="pb-0 pt-4 px-4">
              <CardTitle
                className="text-sm font-semibold"
                style={{ color: "var(--grove-green)" }}
              >
                Reminders
              </CardTitle>
              <CardDescription className="text-xs">
                When to receive your daily notifications
              </CardDescription>
            </CardHeader>
            <CardContent
              className="px-4 pb-2 divide-y"
              style={{ borderColor: "rgba(45,106,79,0.08)" }}
            >
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
                label="Pause notifications"
                description="Silence reminders temporarily"
              >
                <Toggle checked={paused} onChange={setPaused} />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reading */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card
            className="border-0 shadow-sm"
            style={{ backgroundColor: "#fffcf7", borderRadius: "1rem" }}
          >
            <CardHeader className="pb-0 pt-4 px-4">
              <CardTitle
                className="text-sm font-semibold"
                style={{ color: "var(--grove-green)" }}
              >
                Reading
              </CardTitle>
              <CardDescription className="text-xs">
                Quran translation preference
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <SettingRow icon={BookOpen} label="Translation">
                <select
                  value={translationId}
                  onChange={(e) => setTranslationId(e.target.value)}
                  className="rounded-xl border-0 px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 cursor-pointer transition-shadow"
                  style={{
                    backgroundColor: "rgba(45,106,79,0.06)",
                    color: "var(--grove-green)",
                    maxWidth: "10rem",
                  }}
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
        </motion.div>

        {/* Push notifications */}
        <AnimatePresence>
          {notifPermission !== "granted" && (
            <motion.div
              key="notifications"
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <Card
                className="border-0 shadow-sm"
                style={{ backgroundColor: "#fffcf7", borderRadius: "1rem" }}
              >
                <CardHeader className="pb-0 pt-4 px-4">
                  <CardTitle
                    className="text-sm font-semibold"
                    style={{ color: "var(--grove-green)" }}
                  >
                    Push notifications
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {notifPermission === "denied"
                      ? "Notifications are blocked in your browser settings."
                      : "Enable reminders so you never miss a reflection."}
                  </CardDescription>
                </CardHeader>
                {notifPermission !== "denied" && (
                  <CardContent className="px-4 pb-4 pt-2">
                    <button
                      onClick={enableNotifications}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity active:opacity-75"
                      style={{
                        backgroundColor: "rgba(45,106,79,0.08)",
                        color: "var(--grove-green)",
                        border: "1px solid rgba(45,106,79,0.15)",
                      }}
                      data-testid="enable-notifications-btn"
                    >
                      <Bell size={14} />
                      Enable push notifications
                    </button>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save */}
        <motion.div
          custom={sections.length}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            onClick={saveSettings}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{
              background: saved
                ? "#388e3c"
                : "linear-gradient(135deg, var(--grove-green) 0%, var(--grove-green-light) 100%)",
              boxShadow: "0 4px 16px -4px rgba(45,106,79,0.4)",
            }}
            data-testid="save-settings-btn"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={saving ? "saving" : saved ? "saved" : "idle"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Sign out */}
        <motion.div
          custom={sections.length + 1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors"
            style={{ color: "var(--text-muted)" }}
            data-testid="sign-out-btn"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </motion.div>
      </div>
    </main>
  );
}
