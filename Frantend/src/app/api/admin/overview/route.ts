import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getPlans, getTemplates } from "@/lib/server/catalog-store";
import { getManagedProposals } from "@/lib/server/managed-proposal-store";
import { getCustomers, getCustomerStatus } from "@/lib/server/customer-store";

export async function GET() {
  try {
    await requireAdmin();
    const [templates, plans, customers, managedProposals] = await Promise.all([
      getTemplates(),
      getPlans(),
      getCustomers(),
      getManagedProposals(),
    ]);
    const activeCustomers = customers.filter((customer) => getCustomerStatus(customer) === "active").length;
    const expiredCustomers = customers.filter((customer) => getCustomerStatus(customer) === "expired").length;
    const totalLogins = customers.reduce((sum, customer) => sum + customer.loginCount, 0);
    const draftUsers = customers.filter((customer) => customer.recordType === "draft").length;
    const publishedUsers = customers.filter((customer) => customer.recordType === "published").length;
    const formFilledUsers = customers.filter((customer) => customer.formCompletion >= 80).length;

    return NextResponse.json({
      metrics: {
        templates: templates.length,
        plans: plans.length,
        proposals: managedProposals.length,
        customers: customers.length,
        totalRecords: customers.length,
        draftUsers,
        publishedUsers,
        activeCustomers,
        expiredCustomers,
        totalLogins,
        formFilledUsers,
        hasDraftProposal: false,
        hasPublishedProposal: customers.some((customer) => customer.recordType === "published"),
      },
      customers,
      managedProposals,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
