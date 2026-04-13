import { NextResponse } from "next/server";
import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import { upsertCustomerFromProposal } from "@/lib/server/customer-store";
import {
  clearDraftProposal,
  getDraftProposal,
  saveDraftProposal,
} from "@/lib/server/proposal-store";

export async function GET() {
  const proposal = await getDraftProposal();
  return NextResponse.json({ proposal });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { proposal?: ProposalData };
  const proposal = normalizeProposal(body.proposal);

  if (!proposal) {
    return NextResponse.json({ error: "Invalid proposal payload." }, { status: 400 });
  }

  const saved = await saveDraftProposal(proposal);

  if (
    saved &&
    (
      saved.customerDetails.fullName.trim() ||
      saved.customerDetails.email.trim() ||
      saved.boyName.trim() ||
      saved.girlName.trim()
    )
  ) {
    await upsertCustomerFromProposal(saved, {
      recordType: "draft",
      lastAction: "saved draft form",
    });
  }

  return NextResponse.json({ proposal: saved });
}

export async function DELETE() {
  await clearDraftProposal();
  return NextResponse.json({ success: true });
}
