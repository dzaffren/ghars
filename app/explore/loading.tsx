import AppHeader from "@/components/AppHeader";
import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4 space-y-4">
        <Skeleton className="h-8 w-32" />

        {/* Search */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Result placeholders */}
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
