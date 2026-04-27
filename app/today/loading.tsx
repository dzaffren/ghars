import AppHeader from "@/components/AppHeader";
import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4 space-y-6">
        {/* Mission card */}
        <Skeleton className="h-96 w-full rounded-2xl bg-[#1a3a2a]/15" />

        {/* Plant (centered circle) */}
        <div className="flex justify-center py-4">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </div>

        {/* 2-col widget grid */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
