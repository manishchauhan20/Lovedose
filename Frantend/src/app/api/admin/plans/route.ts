import { NextResponse } from "next/server";
import { type PublishPlan } from "@/lib/publish-plans";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getPlans, savePlans, upsertPlan } from "@/lib/server/catalog-store";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    await requireAdmin();
    const plans = await getPlans();
    return NextResponse.json({ plans });
  } catch {
    return unauthorizedResponse();
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { plans?: PublishPlan[] };

    if (!Array.isArray(body.plans)) {
      return NextResponse.json({ error: "Plans array is required." }, { status: 400 });
    }

    const plans = await savePlans(body.plans);
    return NextResponse.json({ plans });
  } catch {
    return unauthorizedResponse();
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { plan?: PublishPlan };

    if (!body.plan) {
      return NextResponse.json({ error: "Plan payload is required." }, { status: 400 });
    }

    const plan = await upsertPlan(body.plan);
    return NextResponse.json({ plan });
  } catch {
    return unauthorizedResponse();
  }
}
