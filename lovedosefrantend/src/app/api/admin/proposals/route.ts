import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { type ManagedProposal } from "@/lib/managed-proposals";
import { getManagedProposals, upsertManagedProposal } from "@/lib/server/managed-proposal-store";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ proposals: await getManagedProposals() });
  } catch {
    return unauthorizedResponse();
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { proposal?: ManagedProposal };

    if (!body.proposal) {
      return NextResponse.json({ error: "Proposal payload is required." }, { status: 400 });
    }

    const proposal = await upsertManagedProposal(body.proposal);
    return NextResponse.json({ proposal });
  } catch {
    return unauthorizedResponse();
  }
}
