import { type ProposalTemplate } from "@/lib/proposal-templates";
import { type ProposalData } from "@/lib/proposal-storage";

export type TemplateRendererProps = {
  proposal: ProposalData;
  template: ProposalTemplate | null;
};
