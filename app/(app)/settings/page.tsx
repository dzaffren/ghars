"use client";

import { useEffect, useState } from "react";
import { Bell, BookOpen, Clock, LogOut, Moon, Pause, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRANSLATIONS = [
  { id: "131", label: "The Clear Quran (Mustafa Khattab)" },
  { id: "85", label: "Sahih International" },
  { id: "20", label: "Pickthall" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
        style={{ color: "var(--grove-green-light)", opacity: 0.7 }}
      >
        {title}
      </p>
      <div
        className="rounded-2xl overflow-hidden divide-y divide-[rgba(45,106,79,0.06)]"
        style={{
          backgroundColor: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(45,106,79,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
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
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={15} style={{ color: "var(--grove-green-light)" }} />
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: "#1a3a2a" }}>
            {label}
          </p>
          {description && (
            <p
              className="text-xs mt-0.5"
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
      className="relative h-[26px] w-[46px] rounded-full transition-colors duration-200 focus-visible:outline-none"
      style={{
        backgroundColor: checked ? "var(--grove-green-light)" : "#d1d5db",
      }}
    >
      <motion.span
        className="absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-sm"
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
      className="rounded-lg px-3 py-1.5 text-sm font-medium outline-none text-center border-0"
      style={{
        backgroundColor: "rgba(45,106,79,0.07)",
        color: "var(--grove-green)",
        minWidth: "5.5rem",
      }}
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
    <main
      className="min-h-screen pb-32"
      style={{ backgroundColor: "var(--sand)" }}
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-xl font-semibold" style={{ color: "#1a3a2a" }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Preferences &amp; reminders
        </p>
      </div>

      <div className="px-5 flex flex-col gap-5 max-w-sm mx-auto">
        {/* Profile */}
        <Section title="Profile">
          <Row
            icon={User}
            label="Display name"
            description="Shown in your greeting"
          >
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="rounded-lg px-3 py-1.5 text-sm font-medium outline-none text-right border-0"
              style={{
                backgroundColor: "rgba(45,106,79,0.07)",
                color: "var(--grove-green)",
                maxWidth: "9rem",
              }}
              data-testid="settings-display-name"
            />
          </Row>
        </Section>

        {/* Reminders */}
        <Section title="Reminders">
          <Row icon={Clock} label="Morning" description="Daily ayah">
            <TimeInput
              value={morningTime}
              onChange={setMorningTime}
              testId="settings-morning-time"
            />
          </Row>
          <Row icon={Moon} label="Evening" description="Reflection prompt">
            <TimeInput
              value={eveningTime}
              onChange={setEveningTime}
              testId="settings-evening-time"
            />
          </Row>
          <Row icon={Pause} label="Pause notifications">
            <Toggle checked={paused} onChange={setPaused} />
          </Row>
        </Section>

        {/* Reading */}
        <Section title="Reading">
          <Row icon={BookOpen} label="Translation">
            <select
              value={translationId}
              onChange={(e) => setTranslationId(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium outline-none border-0 cursor-pointer"
              style={{
                backgroundColor: "rgba(45,106,79,0.07)",
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
          </Row>
        </Section>

        {/* Notifications */}
        <AnimatePresence>
          {notifPermission !== "granted" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Section title="Notifications">
                <div className="px-4 py-3.5">
                  {notifPermission === "denied" ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Notifications are blocked in your browser settings.
                    </p>
                  ) : (
                    <button
                      onClick={enableNotifications}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity active:opacity-70"
                      style={{
                        backgroundColor: "rgba(45,106,79,0.07)",
                        color: "var(--grove-green)",
                        border: "1px solid rgba(45,106,79,0.12)",
                      }}
                      data-testid="enable-notifications-btn"
                    >
                      <Bell size={14} />
                      Enable push notifications
                    </button>
                  )}
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save */}
        <motion.button
          onClick={saveSettings}
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{
            background: saved
              ? "#388e3c"
              : "linear-gradient(135deg, var(--grove-green) 0%, var(--grove-green-light) 100%)",
            boxShadow: "0 4px 16px -4px rgba(45,106,79,0.35)",
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

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm"
          style={{ color: "var(--text-muted)" }}
          data-testid="sign-out-btn"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </main>
  );
}
