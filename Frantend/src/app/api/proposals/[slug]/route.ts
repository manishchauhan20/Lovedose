import { NextResponse } from "next/server";
import { getManagedProposalBySlug } from "@/lib/server/managed-proposal-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const proposal = await getManagedProposalBySlug(slug);

  if (!proposal || proposal.status !== "published") {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  return NextResponse.json({ proposal });
}
