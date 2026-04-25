import DashboardCard from "./DashboardCard";

export interface JournalEntryPreview {
  id: string;
  local_date: string;
  mission_text: string;
  depth_score: number | null;
}

interface Props {
  entry: JournalEntryPreview | null;
}

function formatDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// SVG star — avoids emoji / unicode inconsistency
function DepthDots({ score }: { score: number }) {
  return (
    <div className="mt-2 flex gap-0.5" aria-label={`${score} of 5 depth`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${i < score ? "bg-[#d4a017]" : "bg-[var(--cream-deep)]"}`}
        />
      ))}
    </div>
  );
}

export default function JournalWidget({ entry }: Props) {
  return (
    <DashboardCard href={entry ? `/reflections/${entry.id}` : "/reflections"}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]/60">
        Journal
      </p>
      {!entry ? (
        <p className="text-xs text-muted-foreground">No entries yet</p>
      ) : (
        <>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            {formatDate(entry.local_date)}
          </p>
          <p className="text-xs text-[#1a3a2a] line-clamp-2 leading-snug">
            {entry.mission_text}
          </p>
          {entry.depth_score && <DepthDots score={entry.depth_score} />}
        </>
      )}
    </DashboardCard>
  );
}
