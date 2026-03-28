import { Types } from "mongoose";
import {
  proposalPayloadSchema,
  proposalRecordSchema,
  type ProposalPayload,
} from "../models/proposal.js";
import { ProposalModel } from "../models/proposal-document.js";

function toRecord(document: Record<string, unknown>) {
  return proposalRecordSchema.parse({
    ...document,
    createdAt: new Date(document.createdAt as string | Date).toISOString(),
    updatedAt: new Date(document.updatedAt as string | Date).toISOString(),
  });
}

export class ProposalRepository {
  async list() {
    const documents = await ProposalModel.find().sort({ createdAt: -1 }).lean({ virtuals: true });
    return documents.map((document) => toRecord(document as Record<string, unknown>));
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const document = await ProposalModel.findById(id).lean({ virtuals: true });
    return document ? toRecord(document as Record<string, unknown>) : null;
  }

  async create(payload: ProposalPayload) {
    const validatedPayload = proposalPayloadSchema.parse(payload);
    const document = await ProposalModel.create(validatedPayload);
    return toRecord(document.toJSON() as Record<string, unknown>);
  }

  async update(id: string, payload: ProposalPayload) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const validatedPayload = proposalPayloadSchema.parse(payload);
    const document = await ProposalModel.findByIdAndUpdate(id, validatedPayload, {
      new: true,
      runValidators: true,
    });

    return document ? toRecord(document.toJSON() as Record<string, unknown>) : null;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const deleted = await ProposalModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }
}
