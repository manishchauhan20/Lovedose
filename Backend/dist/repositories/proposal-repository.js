"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalRepository = void 0;
const mongoose_1 = require("mongoose");
const proposal_js_1 = require("../models/proposal.js");
const proposal_document_js_1 = require("../models/proposal-document.js");
function toRecord(document) {
    return proposal_js_1.proposalRecordSchema.parse({
        ...document,
        createdAt: new Date(document.createdAt).toISOString(),
        updatedAt: new Date(document.updatedAt).toISOString(),
    });
}
class ProposalRepository {
    async list() {
        const documents = await proposal_document_js_1.ProposalModel.find().sort({ createdAt: -1 }).lean({ virtuals: true });
        return documents.map((document) => toRecord(document));
    }
    async findById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return null;
        }
        const document = await proposal_document_js_1.ProposalModel.findById(id).lean({ virtuals: true });
        return document ? toRecord(document) : null;
    }
    async create(payload) {
        const validatedPayload = proposal_js_1.proposalPayloadSchema.parse(payload);
        const document = await proposal_document_js_1.ProposalModel.create(validatedPayload);
        return toRecord(document.toJSON());
    }
    async update(id, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return null;
        }
        const validatedPayload = proposal_js_1.proposalPayloadSchema.parse(payload);
        const document = await proposal_document_js_1.ProposalModel.findByIdAndUpdate(id, validatedPayload, {
            new: true,
            runValidators: true,
        });
        return document ? toRecord(document.toJSON()) : null;
    }
    async remove(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return false;
        }
        const deleted = await proposal_document_js_1.ProposalModel.findByIdAndDelete(id);
        return Boolean(deleted);
    }
}
exports.ProposalRepository = ProposalRepository;
