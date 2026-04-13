import { Resend } from "resend";
import { Email } from "@/emails/email";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export async function sendDashboardAccessEmail({
  to,
  fullName,
  templateName,
  publishDurationLabel,
  dashboardPath = "/dashboard",
  proposalPath = "/proposal",
}: {
  to: string;
  fullName: string;
  templateName: string;
  publishDurationLabel: string;
  dashboardPath?: string;
  proposalPath?: string;
}) {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is missing." };
  }

  const dashboardUrl = `${getAppUrl()}${dashboardPath}`;
  const proposalUrl = `${getAppUrl()}${proposalPath}`;

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: "Your LoveDose dashboard access is ready",
    react: Email({
      heading: "Dashboard access ready",
      previewText: "Your LoveDose dashboard is ready.",
      intro: `Hi ${fullName || "there"}, your premium proposal setup is complete.`,
      url: dashboardUrl,
      buttonLabel: "Open Dashboard",
      details: [
        `Template: ${templateName}`,
        `Plan: ${publishDurationLabel}`,
        "Your mail already contains working access links below.",
      ],
      secondaryUrl: proposalUrl,
      secondaryLabel: "Open Proposal",
    }),
  });

  return { success: true };
}

export async function sendForgotPasswordEmail({
  to,
  fullName,
  password,
  dashboardPath = "/dashboard",
}: {
  to: string;
  fullName: string;
  password: string;
  dashboardPath?: string;
}) {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is missing." };
  }

  const dashboardUrl = `${getAppUrl()}${dashboardPath}`;

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: "Your LoveDose dashboard password reminder",
    react: Email({
      heading: "Password reminder",
      previewText: "Your LoveDose dashboard password reminder.",
      intro: `Hi ${fullName || "there"}, you requested your LoveDose dashboard access details.`,
      url: dashboardUrl,
      buttonLabel: "Open Dashboard",
      details: [`Current password: ${password}`],
    }),
  });

  return { success: true };
}
