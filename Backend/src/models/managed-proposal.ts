import { z } from "zod";
import { proposalPayloadSchema } from "./proposal.js";

export const managedProposalStatusSchema = z.enum(["draft", "published"]);

export const managedProposalSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  proposalType: z.string().min(1).default("story"),
  templateId: z.string().default(""),
  themeFamily: z.enum(["romantic", "royal", "dreamy"]).or(z.literal("")).default(""),
  coverImage: z.string().default(""),
  status: managedProposalStatusSchema.default("published"),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
  proposal: proposalPayloadSchema,
});

export type ManagedProposal = z.infer<typeof managedProposalSchema>;
