"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalRecordSchema = exports.proposalPayloadSchema = exports.customerDetailsSchema = exports.publishDurationIdSchema = exports.photoItemSchema = exports.relationshipTypeSchema = void 0;
const zod_1 = require("zod");
exports.relationshipTypeSchema = zod_1.z.enum(["GF", "Crush", "Wife"]);
exports.photoItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    image: zod_1.z.string().default(""),
    caption: zod_1.z.string().default(""),
});
exports.publishDurationIdSchema = zod_1.z.enum([
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
exports.customerDetailsSchema = zod_1.z.object({
    fullName: zod_1.z.string().default(""),
    email: zod_1.z.string().default(""),
    phone: zod_1.z.string().default(""),
    occasion: zod_1.z.string().default(""),
    notes: zod_1.z.string().default(""),
    password: zod_1.z.string().default(""),
});
exports.proposalPayloadSchema = zod_1.z.object({
    boyName: zod_1.z.string().trim().min(1),
    girlName: zod_1.z.string().trim().min(1),
    message: zod_1.z.string().trim().min(1),
    relationshipType: exports.relationshipTypeSchema,
    templateId: zod_1.z.string().default(""),
    howWeMet: zod_1.z.string().default(""),
    firstMeetingDate: zod_1.z.string().default(""),
    nickname: zod_1.z.string().default(""),
    whyILoveYou: zod_1.z.string().default(""),
    futureDreams: zod_1.z.string().default(""),
    heroImage: zod_1.z.string().default(""),
    heroImageCaption: zod_1.z.string().default(""),
    gallery: zod_1.z.array(exports.photoItemSchema).default([]),
    voiceNote: zod_1.z.string().default(""),
    publishDurationId: exports.publishDurationIdSchema.or(zod_1.z.literal("")).default(""),
    publishDurationLabel: zod_1.z.string().default(""),
    publishHours: zod_1.z.number().default(0),
    publishPrice: zod_1.z.number().default(0),
    allTemplateAccess: zod_1.z.boolean().default(false),
    purchasedTemplateIds: zod_1.z.array(zod_1.z.string()).default([]),
    publishExpiresAt: zod_1.z.string().default(""),
    customerDetails: exports.customerDetailsSchema.default({
        fullName: "",
        email: "",
        phone: "",
        occasion: "",
        notes: "",
        password: "",
    }),
});
exports.proposalRecordSchema = exports.proposalPayloadSchema.extend({
    id: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
