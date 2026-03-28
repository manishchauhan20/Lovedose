"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteStateRoutes = exports.siteStateErrorHandler = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const customer_js_1 = require("../models/customer.js");
const publish_plan_js_1 = require("../models/publish-plan.js");
const proposal_js_1 = require("../models/proposal.js");
const template_js_1 = require("../models/template.js");
const site_state_repository_js_1 = require("../repositories/site-state-repository.js");
const siteStateRoutes = (0, express_1.Router)();
exports.siteStateRoutes = siteStateRoutes;
const repository = new site_state_repository_js_1.SiteStateRepository();
siteStateRoutes.get("/overview", async (_request, response, next) => {
    try {
        response.json(await repository.getOverview());
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.get("/templates", async (_request, response, next) => {
    try {
        response.json({ templates: await repository.getTemplates() });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.put("/templates", async (request, response, next) => {
    try {
        const payload = (request.body.templates ?? []).map((item) => template_js_1.proposalTemplateSchema.parse(item));
        response.json({ templates: await repository.saveTemplates(payload) });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.post("/templates", async (request, response, next) => {
    try {
        const payload = template_js_1.proposalTemplateSchema.parse(request.body.template);
        response.json({ template: await repository.upsertTemplate(payload) });
    }
    catch (error) {
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
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.get("/plans", async (_request, response, next) => {
    try {
        response.json({ plans: await repository.getPlans() });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.put("/plans", async (request, response, next) => {
    try {
        const payload = (request.body.plans ?? []).map((item) => publish_plan_js_1.publishPlanSchema.parse(item));
        response.json({ plans: await repository.savePlans(payload) });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.post("/plans", async (request, response, next) => {
    try {
        const payload = publish_plan_js_1.publishPlanSchema.parse(request.body.plan);
        response.json({ plan: await repository.upsertPlan(payload) });
    }
    catch (error) {
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
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.get("/customers", async (_request, response, next) => {
    try {
        response.json({ customers: await repository.getCustomers() });
    }
    catch (error) {
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
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.post("/customers/upsert", async (request, response, next) => {
    try {
        const payload = customer_js_1.customerRecordSchema.parse(request.body.customer);
        response.json({ customer: await repository.upsertCustomer(payload) });
    }
    catch (error) {
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
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.get("/proposal/:kind", async (request, response, next) => {
    try {
        const kind = request.params.kind === "draft" ? "draft" : "published";
        response.json({ proposal: await repository.getProposal(kind) });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.put("/proposal/:kind", async (request, response, next) => {
    try {
        const kind = request.params.kind === "draft" ? "draft" : "published";
        const payload = proposal_js_1.proposalPayloadSchema.parse(request.body.proposal);
        response.json({ proposal: await repository.saveProposal(kind, payload) });
    }
    catch (error) {
        next(error);
    }
});
siteStateRoutes.delete("/proposal/:kind", async (request, response, next) => {
    try {
        const kind = request.params.kind === "draft" ? "draft" : "published";
        await repository.clearProposal(kind);
        response.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
const siteStateErrorHandler = (error, _request, response, _next) => {
    if (error instanceof zod_1.ZodError) {
        response.status(400).json({
            message: "Invalid site-state payload",
            issues: error.flatten(),
        });
        return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    response.status(500).json({ message });
};
exports.siteStateErrorHandler = siteStateErrorHandler;
