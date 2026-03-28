import { NextResponse } from "next/server";
import { getManagedProposals } from "@/lib/server/managed-proposal-store";

export async function GET() {
  try {
    const proposals = await getManagedProposals();
    return NextResponse.json({
      proposals: proposals.filter((proposal) => proposal.status === "published"),
    });
  } catch {
    return NextResponse.json({ proposals: [] });
  }
}
