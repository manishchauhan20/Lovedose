"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRecordSchema = void 0;
const zod_1 = require("zod");
const proposal_js_1 = require("./proposal.js");
exports.customerRecordSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    fullName: zod_1.z.string().default(""),
    email: zod_1.z.string().default(""),
    phone: zod_1.z.string().default(""),
    occasion: zod_1.z.string().default(""),
    notes: zod_1.z.string().default(""),
    templateId: zod_1.z.string().default(""),
    templateName: zod_1.z.string().default(""),
    planId: zod_1.z.string().default(""),
    planLabel: zod_1.z.string().default(""),
    planHours: zod_1.z.number().default(0),
    planPrice: zod_1.z.number().default(0),
    publishExpiresAt: zod_1.z.string().default(""),
    allTemplateAccess: zod_1.z.boolean().default(false),
    loginCount: zod_1.z.number().default(0),
    firstLoginAt: zod_1.z.string().default(""),
    lastLoginAt: zod_1.z.string().default(""),
    formCompletion: zod_1.z.number().default(0),
    formStage: zod_1.z.string().default("started"),
    lastAction: zod_1.z.string().default(""),
    recordType: zod_1.z.enum(["draft", "published"]).default("draft"),
    registeredAt: zod_1.z.string().default(""),
    lastActionAt: zod_1.z.string().default(""),
    createdAt: zod_1.z.string().default(""),
    updatedAt: zod_1.z.string().default(""),
    proposalSnapshot: proposal_js_1.proposalPayloadSchema.nullable().default(null),
});
