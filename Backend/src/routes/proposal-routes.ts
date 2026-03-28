import type { ErrorRequestHandler } from "express";
import { Router } from "express";
import { ZodError } from "zod";
import { ProposalRepository } from "../repositories/proposal-repository.js";
import { proposalPayloadSchema } from "../models/proposal.js";

const proposalRoutes = Router();
const repository = new ProposalRepository();

proposalRoutes.get("/", async (_request, response, next) => {
  try {
    const proposals = await repository.list();
    response.json({ data: proposals });
  } catch (error) {
    next(error);
  }
});

proposalRoutes.get("/:id", async (request, response, next) => {
  try {
    const proposal = await repository.findById(request.params.id);

    if (!proposal) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }

    response.json({ data: proposal });
  } catch (error) {
    next(error);
  }
});

proposalRoutes.post("/", async (request, response, next) => {
  try {
    const payload = proposalPayloadSchema.parse(request.body);
    const proposal = await repository.create(payload);
    response.status(201).json({ data: proposal });
  } catch (error) {
    next(error);
  }
});

proposalRoutes.put("/:id", async (request, response, next) => {
  try {
    const payload = proposalPayloadSchema.parse(request.body);
    const proposal = await repository.update(request.params.id, payload);

    if (!proposal) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }

    response.json({ data: proposal });
  } catch (error) {
    next(error);
  }
});

proposalRoutes.delete("/:id", async (request, response, next) => {
  try {
    const removed = await repository.remove(request.params.id);

    if (!removed) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const proposalErrorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Invalid proposal payload",
      issues: error.flatten(),
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  response.status(500).json({ message });
};

export { proposalRoutes };
