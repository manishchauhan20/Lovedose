import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/server/catalog-store";

export async function GET() {
  return NextResponse.json({ templates: await getTemplates() });
}
