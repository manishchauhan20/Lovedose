import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getCustomers } from "@/lib/server/customer-store";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    await requireAdmin();
    const customers = await getCustomers();
    return NextResponse.json({ customers });
  } catch {
    return unauthorizedResponse();
  }
}
