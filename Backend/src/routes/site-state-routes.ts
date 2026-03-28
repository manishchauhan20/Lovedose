import type { ErrorRequestHandler } from "express";
import { Router } from "express";
import { ZodError } from "zod";
import { customerRecordSchema } from "../models/customer.js";
import { managedProposalSchema } from "../models/managed-proposal.js";
import { publishPlanSchema } from "../models/publish-plan.js";
import { proposalPayloadSchema } from "../models/proposal.js";
import { proposalTemplateSchema } from "../models/template.js";
import { SiteStateRepository } from "../repositories/site-state-repository.js";

const siteStateRoutes = Router();
const repository = new SiteStateRepository();

siteStateRoutes.get("/overview", async (_request, response, next) => {
  try {
    response.json(await repository.getOverview());
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/proposals", async (_request, response, next) => {
  try {
    response.json({ proposals: await repository.getManagedProposals() });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/proposals/:id", async (request, response, next) => {
  try {
    const proposal = await repository.getManagedProposalById(request.params.id);
    if (!proposal) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }
    response.json({ proposal });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/proposal-by-slug/:slug", async (request, response, next) => {
  try {
    const proposal = await repository.getManagedProposalBySlug(request.params.slug);
    if (!proposal) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }
    response.json({ proposal });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.post("/proposals", async (request, response, next) => {
  try {
    const payload = managedProposalSchema.parse(request.body.proposal);
    response.json({ proposal: await repository.upsertManagedProposal(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.put("/proposals/:id", async (request, response, next) => {
  try {
    const payload = managedProposalSchema.parse({ ...request.body.proposal, id: request.params.id });
    response.json({ proposal: await repository.upsertManagedProposal(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.delete("/proposals/:id", async (request, response, next) => {
  try {
    const deleted = await repository.deleteManagedProposal(request.params.id);
    if (!deleted) {
      response.status(404).json({ message: "Proposal not found" });
      return;
    }
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/templates", async (_request, response, next) => {
  try {
    response.json({ templates: await repository.getTemplates() });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.put("/templates", async (request, response, next) => {
  try {
    const payload = (request.body.templates ?? []).map((item: unknown) => proposalTemplateSchema.parse(item));
    response.json({ templates: await repository.saveTemplates(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.post("/templates", async (request, response, next) => {
  try {
    const payload = proposalTemplateSchema.parse(request.body.template);
    response.json({ template: await repository.upsertTemplate(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.delete("/templates/:id", async (request, response, next) => {
  try {
    const deleted = await repository.deleteTemplate(request.params.id);
    if (!deleted) {
      response.status(404).json({ message: "Template not found" });
      return;
    }
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/plans", async (_request, response, next) => {
  try {
    response.json({ plans: await repository.getPlans() });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.put("/plans", async (request, response, next) => {
  try {
    const payload = (request.body.plans ?? []).map((item: unknown) => publishPlanSchema.parse(item));
    response.json({ plans: await repository.savePlans(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.post("/plans", async (request, response, next) => {
  try {
    const payload = publishPlanSchema.parse(request.body.plan);
    response.json({ plan: await repository.upsertPlan(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.delete("/plans/:id", async (request, response, next) => {
  try {
    const deleted = await repository.deletePlan(request.params.id);
    if (!deleted) {
      response.status(404).json({ message: "Plan not found" });
      return;
    }
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/customers", async (_request, response, next) => {
  try {
    response.json({ customers: await repository.getCustomers() });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/customers/:id", async (request, response, next) => {
  try {
    const customer = await repository.getCustomerById(request.params.id);
    if (!customer) {
      response.status(404).json({ message: "Customer not found" });
      return;
    }
    response.json({ customer });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.post("/customers/upsert", async (request, response, next) => {
  try {
    const payload = customerRecordSchema.parse(request.body.customer);
    response.json({ customer: await repository.upsertCustomer(payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.delete("/customers/:id", async (request, response, next) => {
  try {
    const deleted = await repository.deleteCustomer(request.params.id);
    if (!deleted) {
      response.status(404).json({ message: "Customer not found" });
      return;
    }
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.get("/proposal/:kind", async (request, response, next) => {
  try {
    const kind = request.params.kind === "draft" ? "draft" : "published";
    response.json({ proposal: await repository.getProposal(kind) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.put("/proposal/:kind", async (request, response, next) => {
  try {
    const kind = request.params.kind === "draft" ? "draft" : "published";
    const payload = proposalPayloadSchema.parse(request.body.proposal);
    response.json({ proposal: await repository.saveProposal(kind, payload) });
  } catch (error) {
    next(error);
  }
});

siteStateRoutes.delete("/proposal/:kind", async (request, response, next) => {
  try {
    const kind = request.params.kind === "draft" ? "draft" : "published";
    await repository.clearProposal(kind);
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export const siteStateErrorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Invalid site-state payload",
      issues: error.flatten(),
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  response.status(500).json({ message });
};

export { siteStateRoutes };
