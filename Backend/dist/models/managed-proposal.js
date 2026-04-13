"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managedProposalSchema = exports.managedProposalStatusSchema = void 0;
const zod_1 = require("zod");
const proposal_js_1 = require("./proposal.js");
exports.managedProposalStatusSchema = zod_1.z.enum(["draft", "published"]);
exports.managedProposalSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    proposalType: zod_1.z.string().min(1).default("story"),
    templateId: zod_1.z.string().default(""),
    themeFamily: zod_1.z.enum(["romantic", "royal", "dreamy"]).or(zod_1.z.literal("")).default(""),
    coverImage: zod_1.z.string().default(""),
    status: exports.managedProposalStatusSchema.default("published"),
    createdAt: zod_1.z.string().default(""),
    updatedAt: zod_1.z.string().default(""),
    proposal: proposal_js_1.proposalPayloadSchema,
});
