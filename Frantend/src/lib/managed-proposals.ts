import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import { type ProposalTemplate } from "@/lib/proposal-templates";

export type ManagedProposalStatus = "draft" | "published";

export type ManagedProposal = {
  id: string;
  slug: string;
  title: string;
  proposalType: string;
  templateId: string;
  themeFamily: ProposalTemplate["family"] | "";
  coverImage: string;
  status: ManagedProposalStatus;
  createdAt: string;
  updatedAt: string;
  proposal: ProposalData;
};

export function createEmptyManagedProposal(): ManagedProposal {
  return {
    id: "",
    slug: "",
    title: "",
    proposalType: "story",
    templateId: "",
    themeFamily: "",
    coverImage: "",
    status: "published",
    createdAt: "",
    updatedAt: "",
    proposal: normalizeProposal({}) as ProposalData,
  };
}
