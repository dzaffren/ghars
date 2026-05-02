import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReflectionById, upsertReflection } from "@/lib/db/reflections";

const VALID_DID_APPLY = ["yes_fully", "partly", "not_today"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );

  const { id } = await params;
  const reflection = await getReflectionById(id);
  if (!reflection)
    return NextResponse.json(
      {
        error: {
          code: "REFLECTION_NOT_FOUND",
          message: "Reflection not found",
        },
      },
      { status: 404 }
    );

  return NextResponse.json({
    ...reflection,
    reflection_id: reflection.id,
    is_editable: new Date() < new Date(reflection.window_closes_at),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );

  const { id } = await params;
  const reflection = await getReflectionById(id);
  if (!reflection)
    return NextResponse.json(
      {
        error: {
          code: "REFLECTION_NOT_FOUND",
          message: "Reflection not found",
        },
      },
      { status: 404 }
    );

  if (new Date() >= new Date(reflection.window_closes_at)) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT_WINDOW_CLOSED",
          message: "Reflection window has closed",
        },
      },
      { status: 409 }
    );
  }

  let body: Partial<{ did_apply: string; text: string }>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON" } },
      { status: 400 }
    );
  }

  const did_apply = body.did_apply ?? reflection.did_apply;
  const text = body.text ?? reflection.text;

  if (!VALID_DID_APPLY.includes(did_apply)) {
    return NextResponse.json(
      { error: { code: "INVALID_DID_APPLY" } },
      { status: 400 }
    );
  }
  if (text.length < 40)
    return NextResponse.json(
      { error: { code: "REFLECTION_TOO_SHORT" } },
      { status: 400 }
    );
  if (text.length > 2000)
    return NextResponse.json(
      { error: { code: "REFLECTION_TOO_LONG" } },
      { status: 400 }
    );

  const updated = await upsertReflection({
    missionId: reflection.mission_id,
    didApply: did_apply,
    text,
    windowClosesAt: reflection.window_closes_at,
    existingId: id,
  });

  return NextResponse.json({
    ...updated,
    reflection_id: updated.id,
    is_editable: true,
  });
}
