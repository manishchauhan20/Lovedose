import { proposalTemplates, type ProposalTemplate } from "@/lib/generated-proposal-templates";

export { proposalTemplates, type ProposalTemplate };

export function getTemplateById(templateId: string) {
  return proposalTemplates.find((template) => template.id === templateId) ?? null;
}

export function getTemplatesByIds(templateIds: string[]) {
  return templateIds
    .map((templateId) => getTemplateById(templateId))
    .filter((template): template is ProposalTemplate => Boolean(template));
}
