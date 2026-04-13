"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteStateModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const publish_plan_js_1 = require("./publish-plan.js");
const template_js_1 = require("./template.js");
const templateSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    relationshipType: { type: String, required: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    family: { type: String, required: true },
    image: { type: String, default: "" },
}, { _id: false });
const planSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    hours: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    allTemplateAccess: { type: Boolean, required: true, default: false },
}, { _id: false });
const customerSchema = new mongoose_1.Schema({
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
    proposalSnapshot: { type: mongoose_1.Schema.Types.Mixed, default: null },
}, { _id: false });
const managedProposalSchema = new mongoose_1.Schema({
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
    proposal: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { _id: false });
const siteStateSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true, default: "primary" },
    templates: { type: [templateSchema], default: template_js_1.proposalTemplates },
    plans: { type: [planSchema], default: publish_plan_js_1.publishPlans },
    customers: { type: [customerSchema], default: [] },
    managedProposals: { type: [managedProposalSchema], default: [] },
    draftProposal: { type: mongoose_1.Schema.Types.Mixed, default: null },
    publishedProposal: { type: mongoose_1.Schema.Types.Mixed, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
exports.SiteStateModel = mongoose_1.default.models.SiteState ?? mongoose_1.default.model("SiteState", siteStateSchema, "site_state");
