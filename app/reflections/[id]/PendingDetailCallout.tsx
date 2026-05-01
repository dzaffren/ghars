"use client";

import { useRouter } from "next/navigation";
import PendingReflectionBanner from "@/components/PendingReflectionBanner";

// Thin client wrapper so the detail page — a server component — can
// pass a stable `onScored` handler into the banner without itself
// needing to be marked "use client". The handler uses router.refresh()
// so that a successful rescore re-runs the server SELECT and the page
// re-renders with the live marker breakdown.
export default function PendingDetailCallout({
  reflectionId,
}: {
  reflectionId: string;
}) {
  const router = useRouter();
  return (
    <PendingReflectionBanner
      reflectionId={reflectionId}
      onScored={() => {
        router.refresh();
      }}
    />
  );
}
