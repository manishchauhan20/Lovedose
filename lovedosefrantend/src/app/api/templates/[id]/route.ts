import { NextResponse } from "next/server";
import { getTemplateByIdFromStore } from "@/lib/server/catalog-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const template = await getTemplateByIdFromStore(id);

  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json({ template });
}
