import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { commitMission } from "@/lib/db/missions";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let body: {
    assignment_id?: string;
    selected_prompt?: string;
    is_custom?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Request body must be JSON" } },
      { status: 400 }
    );
  }

  const { assignment_id, selected_prompt, is_custom = false } = body;
  if (!assignment_id || !selected_prompt) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_FIELDS",
          message: "assignment_id and selected_prompt are required",
        },
      },
      { status: 400 }
    );
  }

  // Verify assignment belongs to this user
  const supabase = createAdminSupabaseClient();

  // Debug: log the query we're about to run
  console.log("[COMMIT] Looking for assignment:", assignment_id);
  console.log("[COMMIT] Session user_id:", session.userId);
  console.log("[COMMIT] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Fetch assignment with all needed fields
  const { data: assignment, error: queryError } = await supabase
    .from("daily_assignments")
    .select("id, user_id, verse_key, exploration_prompt, corpus_entry_id")
    .eq("id", assignment_id)
    .maybeSingle();

  console.log("[COMMIT] Query result - data:", assignment);
  console.log("[COMMIT] Query result - error:", queryError);

  if (!assignment) {
    return NextResponse.json(
      {
        error: {
          code: "ASSIGNMENT_NOT_FOUND",
          message: `No assignment found with ID ${assignment_id}`,
          debug: {
            query_error: queryError?.message ?? null,
            session_user_id: session.userId,
            assignment_id_searched: assignment_id,
          },
        },
      },
      { status: 404 }
    );
  }

  if (assignment.user_id !== session.userId) {
    return NextResponse.json(
      {
        error: {
          code: "ASSIGNMENT_NOT_FOUND",
          message: "Assignment does not belong to current user",
        },
      },
      { status: 403 }
    );
  }

  // Fetch prompts based on source (corpus or exploration)
  let prompts: string[] = [];
  if (assignment.corpus_entry_id) {
    const { data: corpus } = await supabase
      .from("corpus_entries")
      .select("action_prompt_1, action_prompt_2")
      .eq("id", assignment.corpus_entry_id)
      .single();
    if (corpus) {
      prompts = [corpus.action_prompt_1, corpus.action_prompt_2];
    }
  } else if (assignment.exploration_prompt) {
    prompts = [assignment.exploration_prompt];
  }

  const { result, error } = await commitMission({
    userId: session.userId,
    assignmentId: assignment_id,
    selectedPrompt: selected_prompt,
    isCustom: is_custom,
    prompts,
  });

  if (error) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  return NextResponse.json(result);
}
