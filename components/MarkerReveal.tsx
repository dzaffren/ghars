"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Marker, MarkerBundle } from "@/lib/llm/types";

// MarkerReveal renders the five-marker application-rubric scorecard. It is
// shared by:
//   • TodayClient (post-submission reveal, animated stagger)
//   • ReflectionArchive/detail (journal view, static)
// The `animate` prop toggles between the two modes. In animated mode each
// row fades in with a 150 ms stagger so the mechanism is visible on camera
// during a demo; in static mode rows render immediately with no motion
// wrappers. The summary line "X of 5 markers present" is the only scoring
// surface — a numeric 1–5 grade is NEVER shown (see spec §Non-Goals).

const MARKER_ORDER = [
  "specific_moment",
  "behavioral_change",
  "temporal_anchor",
  "honest_friction",
  "next_step",
] as const satisfies ReadonlyArray<keyof MarkerBundle>;

// User-facing labels drawn verbatim from the spec's Acceptance Criteria
// scenarios ("Specific moment", "Behavioral change", …). Kept here rather
// than in the MarkerBundle type so translation work can localise these
// without touching the data model.
const MARKER_LABELS: Record<keyof MarkerBundle, string> = {
  specific_moment: "Specific moment",
  behavioral_change: "Behavioral change",
  temporal_anchor: "Temporal anchor",
  honest_friction: "Honest friction",
  next_step: "Next step",
};

// dash-cased version of each marker key for use in data-testid attributes.
// E2E tests locate rows as `[data-testid="marker-row-specific-moment"]`.
function testIdFor(key: keyof MarkerBundle): string {
  return `marker-row-${key.replace(/_/g, "-")}`;
}

interface MarkerRevealProps {
  markers: MarkerBundle;
  markerCount: number;
  animate?: boolean;
  className?: string;
}

function MarkerRowBody({ label, marker }: { label: string; marker: Marker }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          marker.present
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/60"
        )}
        aria-hidden
      >
        {marker.present ? (
          <Check size={13} strokeWidth={2.5} />
        ) : (
          <Circle size={13} strokeWidth={2} />
        )}
      </span>
      <div className="flex-1 space-y-0.5">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            marker.present ? "text-[#1a3a2a]" : "text-muted-foreground/60"
          )}
        >
          {label}
        </p>
        {marker.present && marker.triggering_phrase ? (
          <p className="text-xs italic text-[var(--ink-soft)] leading-relaxed">
            &ldquo;{marker.triggering_phrase}&rdquo;
          </p>
        ) : marker.coaching_prompt ? (
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            {marker.coaching_prompt}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function MarkerReveal({
  markers,
  markerCount,
  animate = true,
  className,
}: MarkerRevealProps) {
  const rows = MARKER_ORDER.map((key) => ({
    key,
    label: MARKER_LABELS[key],
    marker: markers[key],
    testid: testIdFor(key),
  }));

  // Static mode: no motion wrappers, no transform styles in the output.
  // Journal detail pages (Task 5) use this so rows show immediately
  // without re-animating each time the user reopens a past reflection.
  if (!animate) {
    return (
      <div className={cn("space-y-3", className)}>
        {rows.map((row) => (
          <div
            key={row.key}
            data-testid={row.testid}
            data-marker-present={row.marker.present ? "true" : "false"}
          >
            <MarkerRowBody label={row.label} marker={row.marker} />
          </div>
        ))}
        <p
          data-testid="marker-summary"
          className="pt-1 text-sm text-[var(--ink-soft)]"
        >
          {markerCount} of 5 markers present
        </p>
      </div>
    );
  }

  // Animated mode: staggered fade-in, ~150 ms apart. Total reveal length is
  // 0.15 * 5 = 0.75 s, after which the summary line appears. `AnimatePresence`
  // is not used — the component renders once per submission and does not
  // need exit animations.
  return (
    <div className={cn("space-y-3", className)}>
      {rows.map((row, i) => (
        <motion.div
          key={row.key}
          data-testid={row.testid}
          data-marker-present={row.marker.present ? "true" : "false"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * i, duration: 0.3, ease: "easeOut" }}
        >
          <MarkerRowBody label={row.label} marker={row.marker} />
        </motion.div>
      ))}
      <motion.p
        data-testid="marker-summary"
        className="pt-1 text-sm text-[var(--ink-soft)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 * 5, duration: 0.3 }}
      >
        {markerCount} of 5 markers present
      </motion.p>
    </div>
  );
}
