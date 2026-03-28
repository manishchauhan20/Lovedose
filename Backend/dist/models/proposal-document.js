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
exports.ProposalModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const proposal_js_1 = require("./proposal.js");
const photoItemSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    image: { type: String, default: "" },
    caption: { type: String, default: "" },
}, { _id: false });
const customerDetailsSchema = new mongoose_1.Schema({
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    occasion: { type: String, default: "" },
    notes: { type: String, default: "" },
    password: { type: String, default: "" },
}, { _id: false });
const proposalSchema = new mongoose_1.Schema({
    boyName: { type: String, required: true, trim: true },
    girlName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relationshipType: {
        type: String,
        enum: proposal_js_1.relationshipTypeSchema.options,
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
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_document, returned) => {
            const transformed = returned;
            transformed.id = String(transformed._id);
            delete transformed._id;
            return transformed;
        },
    },
});
exports.ProposalModel = mongoose_1.default.models.Proposal ?? mongoose_1.default.model("Proposal", proposalSchema, "proposals");
