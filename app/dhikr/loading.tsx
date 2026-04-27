import AppHeader from "@/components/AppHeader";
import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pb-12 pt-6 gap-6">
        <Skeleton className="h-8 w-40" />

        <div className="w-full space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
