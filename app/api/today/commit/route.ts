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
  const { data: assignment } = await supabase
    .from("daily_assignments")
    .select(
      "id, verse_key, exploration_prompt, corpus_entries(action_prompt_1, action_prompt_2)"
    )
    .eq("id", assignment_id)
    .eq("user_id", session.userId)
    .single();

  if (!assignment) {
    return NextResponse.json(
      {
        error: {
          code: "ASSIGNMENT_NOT_FOUND",
          message: "Assignment not found or not owned by user",
        },
      },
      { status: 404 }
    );
  }

  const ce = assignment.corpus_entries as unknown as {
    action_prompt_1: string;
    action_prompt_2: string;
  } | null;
  const prompts: string[] = ce
    ? [ce.action_prompt_1, ce.action_prompt_2]
    : (assignment as { exploration_prompt?: string | null }).exploration_prompt
      ? [(assignment as { exploration_prompt: string }).exploration_prompt]
      : [];

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
