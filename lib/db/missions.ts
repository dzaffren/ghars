import { createAdminSupabaseClient } from "../supabase/server";

export interface CommitResult {
  mission_id: string;
  committed_at: string;
}

export async function commitMission(params: {
  userId: string;
  assignmentId: string;
  selectedPrompt: string;
  isCustom: boolean;
  prompts: [string, string];
}): Promise<{
  result?: CommitResult;
  error?: { code: string; message: string; status: number };
}> {
  const { userId, assignmentId, selectedPrompt, isCustom, prompts } = params;

  // Validate
  if (!isCustom) {
    if (!prompts.includes(selectedPrompt)) {
      return {
        error: {
          code: "PROMPT_MISMATCH",
          message: "selected_prompt does not match any curated option",
          status: 400,
        },
      };
    }
  } else {
    const trimmed = selectedPrompt.trim();
    if (trimmed.length === 0) {
      return {
        error: {
          code: "PROMPT_MISMATCH",
          message: "Custom mission cannot be empty",
          status: 400,
        },
      };
    }
    if (trimmed.length > 280) {
      return {
        error: {
          code: "CUSTOM_TOO_LONG",
          message: "Custom mission must be 280 characters or fewer",
          status: 400,
        },
      };
    }
  }

  const supabase = createAdminSupabaseClient();

  // Check if mission already exists
  const { data: existing } = await supabase
    .from("missions")
    .select("id, selected_prompt, committed_at")
    .eq("assignment_id", assignmentId)
    .single();

  if (existing) {
    // Idempotent: same prompt → return existing
    if (existing.selected_prompt === selectedPrompt) {
      return {
        result: {
          mission_id: existing.id,
          committed_at: existing.committed_at,
        },
      };
    }
    // Different prompt → conflict
    return {
      error: {
        code: "ALREADY_COMMITTED_DIFFERENT",
        message: "Mission already committed for this assignment",
        status: 409,
      },
    };
  }

  // Insert
  const { data, error } = await supabase
    .from("missions")
    .insert({
      assignment_id: assignmentId,
      selected_prompt: isCustom ? selectedPrompt.trim() : selectedPrompt,
      is_custom: isCustom,
    })
    .select("id, committed_at")
    .single();

  if (error || !data) {
    // Check for unique constraint race (another tab committed simultaneously)
    if (error?.code === "23505") {
      const { data: raceExisting } = await supabase
        .from("missions")
        .select("id, selected_prompt, committed_at")
        .eq("assignment_id", assignmentId)
        .single();
      if (raceExisting && raceExisting.selected_prompt === selectedPrompt) {
        return {
          result: {
            mission_id: raceExisting.id,
            committed_at: raceExisting.committed_at,
          },
        };
      }
      return {
        error: {
          code: "ALREADY_COMMITTED_DIFFERENT",
          message: "Mission already committed for this assignment",
          status: 409,
        },
      };
    }
    return {
      error: {
        code: "COMMIT_FAILED",
        message: error?.message ?? "Unknown error",
        status: 500,
      },
    };
  }

  return { result: { mission_id: data.id, committed_at: data.committed_at } };
}
