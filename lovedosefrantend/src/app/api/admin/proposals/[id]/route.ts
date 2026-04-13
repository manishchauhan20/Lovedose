import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { type ManagedProposal } from "@/lib/managed-proposals";
import {
  deleteManagedProposal,
  getManagedProposalById,
  upsertManagedProposal,
} from "@/lib/server/managed-proposal-store";

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
    const proposal = await getManagedProposalById(id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }
    return NextResponse.json({ proposal });
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
    const body = (await request.json()) as { proposal?: ManagedProposal };
    if (!body.proposal) {
      return NextResponse.json({ error: "Proposal payload is required." }, { status: 400 });
    }
    const proposal = await upsertManagedProposal({ ...body.proposal, id });
    return NextResponse.json({ proposal });
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
    await deleteManagedProposal(id);
    return NextResponse.json({ success: true });
  } catch {
    return unauthorizedResponse();
  }
}
