import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DhikrClient from "./DhikrClient";

export default async function DhikrPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();
  const localDate = new Date().toISOString().slice(0, 10);

  const { data: log } = await db
    .from("dhikr_log")
    .select("subhan, alhamd, akbar, completed")
    .eq("user_id", session.userId)
    .eq("local_date", localDate)
    .single();

  return (
    <div className="min-h-screen">
      <AppHeader variant="dhikr" />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pb-12 pt-6 gap-8">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-[#1a3a2a]">Daily Tasbih</h1>
          <p className="text-xs text-muted-foreground">
            SubhanAllah · Alhamdulillah · Allahu Akbar
          </p>
        </div>
        <DhikrClient
          initial={log ?? { subhan: 0, alhamd: 0, akbar: 0, completed: false }}
          localDate={localDate}
        />
      </main>
    </div>
  );
}
