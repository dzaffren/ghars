"use client";

import { useEffect, useState } from "react";

const TRANSLATIONS = [
  { id: "131", label: "The Clear Quran (Mustafa Khattab)" },
  { id: "85", label: "Sahih International" },
  { id: "20", label: "Pickthall" },
];

export default function SettingsPage() {
  const [morningTime, setMorningTime] = useState("08:00");
  const [eveningTime, setEveningTime] = useState("21:00");
  const [translationId, setTranslationId] = useState("131");
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        morning_time: morningTime,
        evening_time: eveningTime,
        translation_id: translationId,
        paused,
      }),
    });
    setSaving(false);
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
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--grove-green)" }}
        >
          Settings
        </h1>

        <div
          className="rounded-2xl p-5 shadow-sm flex flex-col gap-4"
          style={{ backgroundColor: "white" }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Morning reminder
            </label>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              data-testid="settings-morning-time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Evening reminder
            </label>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              data-testid="settings-evening-time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Translation
            </label>
            <select
              value={translationId}
              onChange={(e) => setTranslationId(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              data-testid="settings-translation"
            >
              {TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
              data-testid="settings-pause"
            />
            <span className="text-sm">Pause all notifications</span>
          </label>
        </div>

        {notifPermission !== "granted" && (
          <button
            onClick={enableNotifications}
            className="w-full py-3 rounded-xl text-sm font-medium border"
            style={{
              borderColor: "var(--grove-green)",
              color: "var(--grove-green)",
            }}
            data-testid="enable-notifications-btn"
          >
            Enable push notifications
          </button>
        )}
        {notifPermission === "denied" && (
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
            data-testid="notif-permission-status"
          >
            Notifications are disabled in your browser settings.
          </p>
        )}

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--grove-green)" }}
          data-testid="save-settings-btn"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>

        <button
          onClick={signOut}
          className="w-full py-3 rounded-xl text-sm"
          style={{ color: "var(--text-muted)" }}
          data-testid="sign-out-btn"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
