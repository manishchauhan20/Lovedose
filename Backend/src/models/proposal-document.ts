import mongoose, { Schema } from "mongoose";
import { relationshipTypeSchema } from "./proposal.js";

const photoItemSchema = new Schema(
  {
    id: { type: String, required: true },
    image: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { _id: false },
);

const customerDetailsSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    occasion: { type: String, default: "" },
    notes: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  { _id: false },
);

const proposalSchema = new Schema(
  {
    boyName: { type: String, required: true, trim: true },
    girlName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relationshipType: {
      type: String,
      enum: relationshipTypeSchema.options,
      required: true,
    },
    templateId: { type: String, default: "" },
    howWeMet: { type: String, default: "" },
    firstMeetingDate: { type: String, default: "" },
    nickname: { type: String, default: "" },
    whyILoveYou: { type: String, default: "" },
    futureDreams: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    heroImageCaption: { type: String, default: "" },
    gallery: { type: [photoItemSchema], default: [] },
    voiceNote: { type: String, default: "" },
    publishDurationId: { type: String, default: "" },
    publishDurationLabel: { type: String, default: "" },
    publishHours: { type: Number, default: 0 },
    publishPrice: { type: Number, default: 0 },
    allTemplateAccess: { type: Boolean, default: false },
    purchasedTemplateIds: { type: [String], default: [] },
    publishExpiresAt: { type: String, default: "" },
    customerDetails: { type: customerDetailsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_document, returned) => {
        const transformed = returned as Record<string, unknown>;
        transformed.id = String(transformed._id);
        delete transformed._id;
        return transformed;
      },
    },
  },
);

export const ProposalModel =
  mongoose.models.Proposal ?? mongoose.model("Proposal", proposalSchema, "proposals");
