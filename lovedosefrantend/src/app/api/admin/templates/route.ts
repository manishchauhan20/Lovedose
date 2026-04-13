import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getTemplates, saveTemplates, upsertTemplate } from "@/lib/server/catalog-store";
import { type ProposalTemplate } from "@/lib/proposal-templates";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    await requireAdmin();
    const templates = await getTemplates();
    return NextResponse.json({ templates });
  } catch {
    return unauthorizedResponse();
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { templates?: ProposalTemplate[] };

    if (!Array.isArray(body.templates)) {
      return NextResponse.json({ error: "Templates array is required." }, { status: 400 });
    }

    const templates = await saveTemplates(body.templates);
    return NextResponse.json({ templates });
  } catch {
    return unauthorizedResponse();
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { template?: ProposalTemplate };

    if (!body.template) {
      return NextResponse.json({ error: "Template payload is required." }, { status: 400 });
    }

    const template = await upsertTemplate(body.template);
    return NextResponse.json({ template });
  } catch {
    return unauthorizedResponse();
  }
}
