import { NextResponse } from "next/server";
import { getPlanByIdFromStore, getPlans } from "@/lib/server/catalog-store";

export async function GET() {
  return NextResponse.json({
    plans: await getPlans(),
    rule: "Plans above 24 hours include all template access.",
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const plan = await getPlanByIdFromStore(body.planId ?? "");

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + plan.hours * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    planId: plan.id,
    label: plan.label,
    hours: plan.hours,
    price: plan.price,
    allTemplateAccess: plan.allTemplateAccess,
    publishExpiresAt: expiresAt,
  });
}
