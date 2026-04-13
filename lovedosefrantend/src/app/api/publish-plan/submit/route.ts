import { NextResponse } from "next/server";
import { sendDashboardAccessEmail } from "@/lib/mail";
import { type ProposalData } from "@/lib/proposal-storage";
import {
  getPlanByIdFromStore,
  getTemplateByIdFromStore,
  getTemplates,
} from "@/lib/server/catalog-store";
import { upsertCustomerFromProposal } from "@/lib/server/customer-store";
import { savePublishedProposal } from "@/lib/server/proposal-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    proposal: ProposalData;
    planId: ProposalData["publishDurationId"];
  };

  const plan = await getPlanByIdFromStore(body.planId ?? "");

  if (!plan) {
    return NextResponse.json({ error: "Invalid publish plan." }, { status: 400 });
  }

  const template = await getTemplateByIdFromStore(body.proposal.templateId);

  if (!template) {
    return NextResponse.json({ error: "Invalid template selected." }, { status: 400 });
  }

  const templates = await getTemplates();
  const publishExpiresAt = new Date(Date.now() + plan.hours * 60 * 60 * 1000).toISOString();
  const purchasedTemplateIds = plan.allTemplateAccess
    ? templates.map((item) => item.id)
    : [template.id];

  const nextProposal: ProposalData = {
    ...body.proposal,
    publishDurationId: plan.id,
    publishDurationLabel: plan.label,
    publishHours: plan.hours,
    publishPrice: plan.price,
    allTemplateAccess: plan.allTemplateAccess,
    purchasedTemplateIds,
    publishExpiresAt,
  };

  await savePublishedProposal(nextProposal);
  await upsertCustomerFromProposal(nextProposal, {
    templateName: template.name,
    recordType: "published",
    lastAction: "completed publish plan",
  });

  const emailResult = await sendDashboardAccessEmail({
    to: nextProposal.customerDetails.email,
    fullName: nextProposal.customerDetails.fullName,
    templateName: template.name,
    publishDurationLabel: plan.label,
  });

  return NextResponse.json({
    proposal: nextProposal,
    emailSent: emailResult.success,
    emailError: emailResult.success ? null : emailResult.error,
    message: emailResult.success
      ? "Mail sended successfully."
      : "Proposal saved, but mail could not be sent.",
  });
}
