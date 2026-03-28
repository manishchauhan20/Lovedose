import mongoose, { Schema } from "mongoose";
import { publishPlans } from "./publish-plan.js";
import { proposalTemplates } from "./template.js";

const templateSchema = new Schema(
  {
    id: { type: String, required: true },
    relationshipType: { type: String, required: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    family: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const planSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    hours: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    allTemplateAccess: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    id: { type: String, required: true },
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    occasion: { type: String, default: "" },
    notes: { type: String, default: "" },
    templateId: { type: String, default: "" },
    templateName: { type: String, default: "" },
    planId: { type: String, default: "" },
    planLabel: { type: String, default: "" },
    planHours: { type: Number, default: 0 },
    planPrice: { type: Number, default: 0 },
    publishExpiresAt: { type: String, default: "" },
    allTemplateAccess: { type: Boolean, default: false },
    loginCount: { type: Number, default: 0 },
    firstLoginAt: { type: String, default: "" },
    lastLoginAt: { type: String, default: "" },
    formCompletion: { type: Number, default: 0 },
    formStage: { type: String, default: "started" },
    lastAction: { type: String, default: "" },
    recordType: { type: String, enum: ["draft", "published"], default: "draft" },
    registeredAt: { type: String, default: "" },
    lastActionAt: { type: String, default: "" },
    createdAt: { type: String, default: "" },
    updatedAt: { type: String, default: "" },
    proposalSnapshot: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const managedProposalSchema = new Schema(
  {
    id: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    proposalType: { type: String, required: true, default: "story" },
    templateId: { type: String, default: "" },
    themeFamily: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    createdAt: { type: String, default: "" },
    updatedAt: { type: String, default: "" },
    proposal: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const siteStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    templates: { type: [templateSchema], default: proposalTemplates },
    plans: { type: [planSchema], default: publishPlans },
    customers: { type: [customerSchema], default: [] },
    managedProposals: { type: [managedProposalSchema], default: [] },
    draftProposal: { type: Schema.Types.Mixed, default: null },
    publishedProposal: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SiteStateModel =
  mongoose.models.SiteState ?? mongoose.model("SiteState", siteStateSchema, "site_state");
