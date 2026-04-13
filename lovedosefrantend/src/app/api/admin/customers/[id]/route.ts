import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { deleteCustomer, getCustomerById } from "@/lib/server/customer-store";

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
    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({ customer });
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
    const deleted = await deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return unauthorizedResponse();
  }
}
