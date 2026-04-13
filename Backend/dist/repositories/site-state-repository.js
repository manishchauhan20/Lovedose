"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteStateRepository = void 0;
const customer_js_1 = require("../models/customer.js");
const managed_proposal_js_1 = require("../models/managed-proposal.js");
const publish_plan_js_1 = require("../models/publish-plan.js");
const proposal_js_1 = require("../models/proposal.js");
const template_js_1 = require("../models/template.js");
const site_state_document_js_1 = require("../models/site-state-document.js");
function normalizeCustomers(customers) {
    return customers.map((customer) => customer_js_1.customerRecordSchema.parse(customer));
}
class SiteStateRepository {
    async ensureState() {
        const existing = await site_state_document_js_1.SiteStateModel.findOne({ key: "primary" });
        if (existing) {
            return existing;
        }
        return site_state_document_js_1.SiteStateModel.create({ key: "primary" });
    }
    async getOverview() {
        const state = await this.ensureState();
        return {
            templates: (state.templates ?? []).map((template) => template_js_1.proposalTemplateSchema.parse(template)),
            plans: (state.plans ?? []).map((plan) => publish_plan_js_1.publishPlanSchema.parse(plan)),
            customers: normalizeCustomers(state.customers ?? []),
            managedProposals: (state.managedProposals ?? []).map((proposal) => managed_proposal_js_1.managedProposalSchema.parse(proposal)),
            draftProposal: state.draftProposal ? proposal_js_1.proposalPayloadSchema.parse(state.draftProposal) : null,
            publishedProposal: state.publishedProposal ? proposal_js_1.proposalPayloadSchema.parse(state.publishedProposal) : null,
        };
    }
    async getManagedProposals() {
        const state = await this.ensureState();
        return (state.managedProposals ?? []).map((proposal) => managed_proposal_js_1.managedProposalSchema.parse(proposal));
    }
    async getManagedProposalById(id) {
        const state = await this.ensureState();
        const proposal = (state.managedProposals ?? []).find((item) => item.id === id);
        return proposal ? managed_proposal_js_1.managedProposalSchema.parse(proposal) : null;
    }
    async getManagedProposalBySlug(slug) {
        const state = await this.ensureState();
        const proposal = (state.managedProposals ?? []).find((item) => item.slug === slug);
        return proposal ? managed_proposal_js_1.managedProposalSchema.parse(proposal) : null;
    }
    async upsertManagedProposal(proposal) {
        const validated = managed_proposal_js_1.managedProposalSchema.parse(proposal);
        const state = await this.ensureState();
        const next = (state.managedProposals ?? []).filter((item) => item.id !== validated.id);
        next.push(validated);
        state.managedProposals = next;
        await state.save();
        return validated;
    }
    async deleteManagedProposal(id) {
        const state = await this.ensureState();
        const next = (state.managedProposals ?? []).filter((item) => item.id !== id);
        if (next.length === (state.managedProposals ?? []).length) {
            return false;
        }
        state.managedProposals = next;
        await state.save();
        return true;
    }
    async getTemplates() {
        const state = await this.ensureState();
        return (state.templates ?? []).map((template) => template_js_1.proposalTemplateSchema.parse(template));
    }
    async saveTemplates(templates) {
        const validated = templates.map((template) => template_js_1.proposalTemplateSchema.parse(template));
        const state = await this.ensureState();
        state.templates = validated;
        await state.save();
        return validated;
    }
    async upsertTemplate(template) {
        const validated = template_js_1.proposalTemplateSchema.parse(template);
        const state = await this.ensureState();
        const nextTemplates = (state.templates ?? []).filter((item) => item.id !== validated.id);
        nextTemplates.push(validated);
        state.templates = nextTemplates;
        await state.save();
        return validated;
    }
    async deleteTemplate(id) {
        const state = await this.ensureState();
        const nextTemplates = (state.templates ?? []).filter((item) => item.id !== id);
        if (nextTemplates.length === (state.templates ?? []).length) {
            return false;
        }
        state.templates = nextTemplates;
        await state.save();
        return true;
    }
    async getPlans() {
        const state = await this.ensureState();
        return (state.plans ?? []).map((plan) => publish_plan_js_1.publishPlanSchema.parse(plan));
    }
    async savePlans(plans) {
        const validated = plans.map((plan) => publish_plan_js_1.publishPlanSchema.parse(plan));
        const state = await this.ensureState();
        state.plans = validated;
        await state.save();
        return validated;
    }
    async upsertPlan(plan) {
        const validated = publish_plan_js_1.publishPlanSchema.parse(plan);
        const state = await this.ensureState();
        const nextPlans = (state.plans ?? []).filter((item) => item.id !== validated.id);
        nextPlans.push(validated);
        state.plans = nextPlans;
        await state.save();
        return validated;
    }
    async deletePlan(id) {
        const state = await this.ensureState();
        const nextPlans = (state.plans ?? []).filter((item) => item.id !== id);
        if (nextPlans.length === (state.plans ?? []).length) {
            return false;
        }
        state.plans = nextPlans;
        await state.save();
        return true;
    }
    async getCustomers() {
        const state = await this.ensureState();
        return normalizeCustomers(state.customers ?? []);
    }
    async getCustomerById(id) {
        const state = await this.ensureState();
        const customer = (state.customers ?? []).find((item) => item.id === id);
        return customer ? customer_js_1.customerRecordSchema.parse(customer) : null;
    }
    async upsertCustomer(customer) {
        const validated = customer_js_1.customerRecordSchema.parse(customer);
        const state = await this.ensureState();
        const nextCustomers = (state.customers ?? []).filter((item) => item.id !== validated.id);
        nextCustomers.push(validated);
        state.customers = nextCustomers;
        await state.save();
        return validated;
    }
    async deleteCustomer(id) {
        const state = await this.ensureState();
        const nextCustomers = (state.customers ?? []).filter((item) => item.id !== id);
        if (nextCustomers.length === (state.customers ?? []).length) {
            return false;
        }
        state.customers = nextCustomers;
        await state.save();
        return true;
    }
    async saveProposal(kind, proposal) {
        const validated = proposal_js_1.proposalPayloadSchema.parse(proposal);
        const state = await this.ensureState();
        if (kind === "draft") {
            state.draftProposal = validated;
        }
        else {
            state.publishedProposal = validated;
        }
        await state.save();
        return validated;
    }
    async getProposal(kind) {
        const state = await this.ensureState();
        const proposal = kind === "draft" ? state.draftProposal : state.publishedProposal;
        return proposal ? proposal_js_1.proposalPayloadSchema.parse(proposal) : null;
    }
    async clearProposal(kind) {
        const state = await this.ensureState();
        if (kind === "draft") {
            state.draftProposal = null;
        }
        else {
            state.publishedProposal = null;
        }
        await state.save();
    }
}
exports.SiteStateRepository = SiteStateRepository;
