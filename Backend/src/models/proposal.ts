import { z } from "zod";

export const relationshipTypeSchema = z.enum([
  "GF",
  "Crush",
  "Wife",
  "Best Friends",
  "Boyfrends",
  "Dost",
  "Husband",
]);

export const photoItemSchema = z.object({
  id: z.string().min(1),
  image: z.string().default(""),
  caption: z.string().default(""),
});

export const publishDurationIdSchema = z.enum([
  "1h",
  "3h",
  "6h",
  "12h",
  "24h",
  "1m",
  "3m",
  "6m",
  "1y",
]);

export const customerDetailsSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  occasion: z.string().default(""),
  notes: z.string().default(""),
  password: z.string().default(""),
});

export const proposalPayloadSchema = z.object({
  boyName: z.string().trim().min(1),
  girlName: z.string().trim().min(1),
  message: z.string().trim().min(1),
  relationshipType: relationshipTypeSchema,
  templateId: z.string().default(""),
  howWeMet: z.string().default(""),
  firstMeetingDate: z.string().default(""),
  nickname: z.string().default(""),
  whyILoveYou: z.string().default(""),
  futureDreams: z.string().default(""),
  heroImage: z.string().default(""),
  heroImageCaption: z.string().default(""),
  gallery: z.array(photoItemSchema).default([]),
  voiceNote: z.string().default(""),
  publishDurationId: publishDurationIdSchema.or(z.literal("")).default(""),
  publishDurationLabel: z.string().default(""),
  publishHours: z.number().default(0),
  publishPrice: z.number().default(0),
  allTemplateAccess: z.boolean().default(false),
  purchasedTemplateIds: z.array(z.string()).default([]),
  publishExpiresAt: z.string().default(""),
  customerDetails: customerDetailsSchema.default({
    fullName: "",
    email: "",
    phone: "",
    occasion: "",
    notes: "",
    password: "",
  }),
});

export const proposalRecordSchema = proposalPayloadSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProposalPayload = z.infer<typeof proposalPayloadSchema>;
export type ProposalRecord = z.infer<typeof proposalRecordSchema>;
