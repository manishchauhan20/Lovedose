import { type ProposalTemplate } from "@/lib/proposal-templates";

export const DEFAULT_TEMPLATE_RENDERER = "Girlfriend-Collection/proposal-experience";

export const TEMPLATE_RENDERER_PRESETS = [
  "Girlfriend-Collection/proposal-experience",
  "Girlfriend-Collection/praposal-experience2",
  "Girlfriend-Collection/praposal-exprience3",
  // "Girlfriend-Collection/praposal-experience4",
  "Wife-Collection/wifecollection1",
  "Wife-Collection/proposal-template2",
  "Wife-Collection/wife-collection2",
  "Crush-Collection/crush-collection1",
  "Crush-Collection/crush-collection2",
  "Crush-Collection/proposal-template3",
] as const;

export function getDefaultRendererKeyForFamily(
  family: ProposalTemplate["family"] | "" | null | undefined,
) {
  if (family === "royal") {
    return "Wife-Collection/proposal-template2";
  }

  if (family === "dreamy") {
    return "Crush-Collection/proposal-template3";
  }

  return DEFAULT_TEMPLATE_RENDERER;
}

export function resolveTemplateRendererKey(template: ProposalTemplate | null) {
  if (template?.rendererKey?.trim()) {
    return template.rendererKey.trim();
  }

  return getDefaultRendererKeyForFamily(template?.family);
}
