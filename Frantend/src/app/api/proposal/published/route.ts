import { NextResponse } from "next/server";
import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import {
  getPublishedProposal,
  savePublishedProposal,
} from "@/lib/server/proposal-store";

export async function GET() {
  const proposal = await getPublishedProposal();
  return NextResponse.json({ proposal });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { proposal?: ProposalData };
  const proposal = normalizeProposal(body.proposal);

  if (!proposal) {
    return NextResponse.json({ error: "Invalid proposal payload." }, { status: 400 });
  }

  const saved = await savePublishedProposal(proposal);
  return NextResponse.json({ proposal: saved });
}
