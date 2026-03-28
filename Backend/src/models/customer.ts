import { z } from "zod";
import { proposalPayloadSchema } from "./proposal.js";

export const customerRecordSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  occasion: z.string().default(""),
  notes: z.string().default(""),
  templateId: z.string().default(""),
  templateName: z.string().default(""),
  planId: z.string().default(""),
  planLabel: z.string().default(""),
  planHours: z.number().default(0),
  planPrice: z.number().default(0),
  publishExpiresAt: z.string().default(""),
  allTemplateAccess: z.boolean().default(false),
  loginCount: z.number().default(0),
  firstLoginAt: z.string().default(""),
  lastLoginAt: z.string().default(""),
  formCompletion: z.number().default(0),
  formStage: z.string().default("started"),
  lastAction: z.string().default(""),
  recordType: z.enum(["draft", "published"]).default("draft"),
  registeredAt: z.string().default(""),
  lastActionAt: z.string().default(""),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
  proposalSnapshot: proposalPayloadSchema.nullable().default(null),
});

export type CustomerRecord = z.infer<typeof customerRecordSchema>;
