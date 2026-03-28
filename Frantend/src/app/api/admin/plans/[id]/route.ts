import { NextResponse } from "next/server";
import { type PublishPlan } from "@/lib/publish-plans";
import { requireAdmin } from "@/lib/server/admin-auth";
import { deletePlan, getPlanByIdFromStore, upsertPlan } from "@/lib/server/catalog-store";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const plan = await getPlanByIdFromStore(id);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch {
    return unauthorizedResponse();
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as { plan?: PublishPlan };

    if (!body.plan) {
      return NextResponse.json({ error: "Plan payload is required." }, { status: 400 });
    }

    const plan = await upsertPlan({ ...body.plan, id: id as PublishPlan["id"] });
    return NextResponse.json({ plan });
  } catch {
    return unauthorizedResponse();
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const deleted = await deletePlan(id);

    if (!deleted) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return unauthorizedResponse();
  }
}
