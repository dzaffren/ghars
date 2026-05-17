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

  // Debug: check if assignment exists at all
  const { data: assignmentCheck } = await supabase
    .from("daily_assignments")
    .select("id, user_id")
    .eq("id", assignment_id)
    .maybeSingle();

  if (!assignmentCheck) {
    return NextResponse.json(
      {
        error: {
          code: "ASSIGNMENT_NOT_FOUND",
          message: `[DEBUG-v1] No assignment found with id ${assignment_id}`,
        },
      },
      { status: 404 }
    );
  }

  if (assignmentCheck.user_id !== session.userId) {
    return NextResponse.json(
      {
        error: {
          code: "ASSIGNMENT_NOT_FOUND",
          message: `[DEBUG-v1] Assignment user_id mismatch: assignment=${assignmentCheck.user_id}, session=${session.userId}`,
        },
      },
      { status: 404 }
    );
  }

  const { data: assignment } = await supabase
    .from("daily_assignments")
    .select("id, verse_key, exploration_prompt, corpus_entry_id")
    .eq("id", assignment_id)
    .eq("user_id", session.userId)
    .maybeSingle();

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
