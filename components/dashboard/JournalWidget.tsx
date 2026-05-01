import DashboardCard from "./DashboardCard";

// Dashboard widget preview for the latest reflection on /today. The v2
// rubric replaces the retired depth score with a marker count; the
// widget stays compact — a single "N of 5 markers" caption is enough,
// the full breakdown lives on the detail page.
export interface JournalEntryPreview {
  id: string;
  local_date: string;
  mission_text: string;
  marker_count: number | null;
  status: "scored" | "pending";
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
          <p className="mt-2 text-[10px] text-muted-foreground">
            {entry.status === "pending"
              ? "Pending"
              : `${entry.marker_count ?? 0} of 5 markers`}
          </p>
        </>
      )}
    </DashboardCard>
  );
}
