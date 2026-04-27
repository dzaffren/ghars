import AppHeader from "@/components/AppHeader";
import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-8 pt-4 space-y-6">
        {/* Title */}
        <Skeleton className="h-8 w-48" />

        {/* 10 x 6 grid of day squares */}
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 60 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
