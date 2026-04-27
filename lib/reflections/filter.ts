// Pure filter helper for reflections archive.
// Extracted from app/reflections/ReflectionArchive.tsx so the logic is
// unit-testable without rendering the client component.

export interface ReflectionLike {
  id: string;
  text: string;
  llm_verdict?: string;
  llm_feedback?: string | null;
  depth_score?: number | null;
}

export interface ReflectionEntry {
  id: string;
  local_date: string;
  verse_key: string;
  verse_translation: string;
  mission_text: string;
  focus_area: string | null;
  reflections: ReflectionLike | ReflectionLike[] | null;
}

export interface FilterOptions {
  activeFilter: string | null;
  search: string;
}

export function getRef(entry: ReflectionEntry): ReflectionLike | null {
  if (!entry.reflections) return null;
  return Array.isArray(entry.reflections)
    ? (entry.reflections[0] ?? null)
    : entry.reflections;
}

export function filterReflections<T extends ReflectionEntry>(
  entries: T[],
  { activeFilter, search }: FilterOptions
): T[] {
  let list = entries;
  if (activeFilter) {
    list = list.filter((e) => e.focus_area === activeFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((e) => {
      const ref = getRef(e);
      return (
        e.mission_text.toLowerCase().includes(q) ||
        e.verse_translation.toLowerCase().includes(q) ||
        (ref?.text ?? "").toLowerCase().includes(q)
      );
    });
  }
  return list;
}
