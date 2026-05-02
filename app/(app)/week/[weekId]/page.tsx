"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Reflection {
  verse_key: string;
  surah_name: string;
  ayah_number: number;
  mission_text: string;
  reflection_text: string;
  did_apply: string;
  date: string;
}

interface WeekDetail {
  week_id: number;
  reflections: Reflection[];
  closing_line: string;
}

const DID_APPLY_LABEL: Record<string, string> = {
  yes_fully: "Yes, fully",
  partly: "Partly",
  not_today: "Not today",
};

export default function WeekReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<WeekDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weeks/${params.weekId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.weekId]);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading your week…</p>
      </div>
    );

  if (!data)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <div className="text-center">
          <p style={{ color: "var(--text-muted)" }}>Week not found.</p>
          <button
            onClick={() => router.push("/grove")}
            className="mt-4 text-sm underline"
            style={{ color: "var(--grove-green)" }}
          >
            Back to grove
          </button>
        </div>
      </div>
    );

  return (
    <main
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <div>
          <button
            onClick={() => router.push("/grove")}
            className="text-sm mb-4 block"
            style={{ color: "var(--grove-green)" }}
          >
            ← Back to grove
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--grove-green)" }}
            data-testid="week-review-header"
          >
            Here&rsquo;s what Allah guided you through this week
          </h1>
        </div>

        {data.reflections.map((r, i) => (
          <div
            key={r.verse_key + i}
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "white" }}
            data-testid={`week-reflection-${i + 1}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--grove-green)" }}
                >
                  Day {i + 1}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {r.date}
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "#f0f7f4",
                  color: "var(--grove-green)",
                }}
              >
                {DID_APPLY_LABEL[r.did_apply] ?? r.did_apply}
              </span>
            </div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              {r.surah_name} · {r.ayah_number} — {r.verse_key}
            </p>
            <p
              className="text-xs italic mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Mission: {r.mission_text}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {r.reflection_text}
            </p>
          </div>
        ))}

        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#f0f7f4" }}
          data-testid="week-closing"
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--grove-green)" }}
          >
            {data.closing_line}
          </p>
        </div>
      </div>
    </main>
  );
}
