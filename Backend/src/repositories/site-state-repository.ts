import { customerRecordSchema, type CustomerRecord } from "../models/customer.js";
import { managedProposalSchema, type ManagedProposal } from "../models/managed-proposal.js";
import { publishPlanSchema, type PublishPlan } from "../models/publish-plan.js";
import {
  proposalPayloadSchema,
  type ProposalPayload,
} from "../models/proposal.js";
import {
  proposalTemplateSchema,
  type ProposalTemplate,
} from "../models/template.js";
import { SiteStateModel } from "../models/site-state-document.js";

type ProposalKind = "draft" | "published";

function normalizeCustomers(customers: unknown[]) {
  return customers.map((customer) => customerRecordSchema.parse(customer));
}

export class SiteStateRepository {
  private async ensureState() {
    const existing = await SiteStateModel.findOne({ key: "primary" });
    if (existing) {
      return existing;
    }

    return SiteStateModel.create({ key: "primary" });
  }

  async getOverview() {
    const state = await this.ensureState();
    return {
      templates: (state.templates ?? []).map((template: unknown) => proposalTemplateSchema.parse(template)),
      plans: (state.plans ?? []).map((plan: unknown) => publishPlanSchema.parse(plan)),
      customers: normalizeCustomers(state.customers ?? []),
      managedProposals: (state.managedProposals ?? []).map((proposal: unknown) => managedProposalSchema.parse(proposal)),
      draftProposal: state.draftProposal ? proposalPayloadSchema.parse(state.draftProposal) : null,
      publishedProposal: state.publishedProposal ? proposalPayloadSchema.parse(state.publishedProposal) : null,
    };
  }

  async getManagedProposals() {
    const state = await this.ensureState();
    return (state.managedProposals ?? []).map((proposal: unknown) => managedProposalSchema.parse(proposal));
  }

  async getManagedProposalById(id: string) {
    const state = await this.ensureState();
    const proposal = (state.managedProposals ?? []).find((item: ManagedProposal) => item.id === id);
    return proposal ? managedProposalSchema.parse(proposal) : null;
  }

  async getManagedProposalBySlug(slug: string) {
    const state = await this.ensureState();
    const proposal = (state.managedProposals ?? []).find((item: ManagedProposal) => item.slug === slug);
    return proposal ? managedProposalSchema.parse(proposal) : null;
  }

  async upsertManagedProposal(proposal: ManagedProposal) {
    const validated = managedProposalSchema.parse(proposal);
    const state = await this.ensureState();
    const next = (state.managedProposals ?? []).filter((item: ManagedProposal) => item.id !== validated.id);
    next.push(validated);
    state.managedProposals = next;
    await state.save();
    return validated;
  }

  async deleteManagedProposal(id: string) {
    const state = await this.ensureState();
    const next = (state.managedProposals ?? []).filter((item: ManagedProposal) => item.id !== id);
    if (next.length === (state.managedProposals ?? []).length) {
      return false;
    }
    state.managedProposals = next;
    await state.save();
    return true;
  }

  async getTemplates() {
    const state = await this.ensureState();
    return (state.templates ?? []).map((template: unknown) => proposalTemplateSchema.parse(template));
  }

  async saveTemplates(templates: ProposalTemplate[]) {
    const validated = templates.map((template) => proposalTemplateSchema.parse(template));
    const state = await this.ensureState();
    state.templates = validated;
    await state.save();
    return validated;
  }

  async upsertTemplate(template: ProposalTemplate) {
    const validated = proposalTemplateSchema.parse(template);
    const state = await this.ensureState();
    const nextTemplates = (state.templates ?? []).filter((item: ProposalTemplate) => item.id !== validated.id);
    nextTemplates.push(validated);
    state.templates = nextTemplates;
    await state.save();
    return validated;
  }

  async deleteTemplate(id: string) {
    const state = await this.ensureState();
    const nextTemplates = (state.templates ?? []).filter((item: ProposalTemplate) => item.id !== id);
    if (nextTemplates.length === (state.templates ?? []).length) {
      return false;
    }
    state.templates = nextTemplates;
    await state.save();
    return true;
  }

  async getPlans() {
    const state = await this.ensureState();
    return (state.plans ?? []).map((plan: unknown) => publishPlanSchema.parse(plan));
  }

  async savePlans(plans: PublishPlan[]) {
    const validated = plans.map((plan) => publishPlanSchema.parse(plan));
    const state = await this.ensureState();
    state.plans = validated;
    await state.save();
    return validated;
  }

  async upsertPlan(plan: PublishPlan) {
    const validated = publishPlanSchema.parse(plan);
    const state = await this.ensureState();
    const nextPlans = (state.plans ?? []).filter((item: PublishPlan) => item.id !== validated.id);
    nextPlans.push(validated);
    state.plans = nextPlans;
    await state.save();
    return validated;
  }

  async deletePlan(id: string) {
    const state = await this.ensureState();
    const nextPlans = (state.plans ?? []).filter((item: PublishPlan) => item.id !== id);
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

  async getCustomerById(id: string) {
    const state = await this.ensureState();
    const customer = (state.customers ?? []).find((item: CustomerRecord) => item.id === id);
    return customer ? customerRecordSchema.parse(customer) : null;
  }

  async upsertCustomer(customer: CustomerRecord) {
    const validated = customerRecordSchema.parse(customer);
    const state = await this.ensureState();
    const nextCustomers = (state.customers ?? []).filter((item: CustomerRecord) => item.id !== validated.id);
    nextCustomers.push(validated);
    state.customers = nextCustomers;
    await state.save();
    return validated;
  }

  async deleteCustomer(id: string) {
    const state = await this.ensureState();
    const nextCustomers = (state.customers ?? []).filter((item: CustomerRecord) => item.id !== id);
    if (nextCustomers.length === (state.customers ?? []).length) {
      return false;
    }
    state.customers = nextCustomers;
    await state.save();
    return true;
  }

  async saveProposal(kind: ProposalKind, proposal: ProposalPayload) {
    const validated = proposalPayloadSchema.parse(proposal);
    const state = await this.ensureState();
    if (kind === "draft") {
      state.draftProposal = validated;
    } else {
      state.publishedProposal = validated;
    }
    await state.save();
    return validated;
  }

  async getProposal(kind: ProposalKind) {
    const state = await this.ensureState();
    const proposal = kind === "draft" ? state.draftProposal : state.publishedProposal;
    return proposal ? proposalPayloadSchema.parse(proposal) : null;
  }

  async clearProposal(kind: ProposalKind) {
    const state = await this.ensureState();
    if (kind === "draft") {
      state.draftProposal = null;
    } else {
      state.publishedProposal = null;
    }
    await state.save();
  }
}
