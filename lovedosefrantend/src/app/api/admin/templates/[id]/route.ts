import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  deleteTemplate,
  getTemplateByIdFromStore,
  upsertTemplate,
} from "@/lib/server/catalog-store";
import { type ProposalTemplate } from "@/lib/proposal-templates";

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
    const template = await getTemplateByIdFromStore(id);

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ template });
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
    const body = (await request.json()) as { template?: ProposalTemplate };

    if (!body.template) {
      return NextResponse.json({ error: "Template payload is required." }, { status: 400 });
    }

    const template = await upsertTemplate({ ...body.template, id });
    return NextResponse.json({ template });
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
    const deleted = await deleteTemplate(id);

    if (!deleted) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return unauthorizedResponse();
  }
}
