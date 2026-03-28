import { NextResponse } from "next/server";
import { recordCustomerLogin } from "@/lib/server/customer-store";
import { getPublishedProposal } from "@/lib/server/proposal-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email or password is missing." }, { status: 400 });
  }

  const proposal = await getPublishedProposal();

  if (!proposal) {
    return NextResponse.json({ error: "No published proposal found." }, { status: 404 });
  }

  const isValid =
    body.email.trim() === proposal.customerDetails.email &&
    body.password === proposal.customerDetails.password;

  if (!isValid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await recordCustomerLogin(proposal.customerDetails.email);

  return NextResponse.json({
    success: true,
    customer: {
      fullName: proposal.customerDetails.fullName,
      email: proposal.customerDetails.email,
    },
  });
}
