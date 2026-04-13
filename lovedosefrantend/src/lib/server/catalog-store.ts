import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  proposalTemplates as defaultTemplates,
  type ProposalTemplate,
} from "@/lib/proposal-templates";
import { publishPlans as defaultPlans, type PublishPlan } from "@/lib/publish-plans";
import { backendRequest } from "@/lib/server/backend-api";

type CatalogStore = {
  templates: ProposalTemplate[];
  plans: PublishPlan[];
};

const storePath = path.join(process.cwd(), "data", "catalog-store.json");

const defaultStore: CatalogStore = {
  templates: defaultTemplates,
  plans: defaultPlans,
};

async function ensureStoreDir() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

async function readStore(): Promise<CatalogStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CatalogStore>;

    return {
      templates: Array.isArray(parsed.templates) && parsed.templates.length > 0
        ? parsed.templates
        : defaultStore.templates,
      plans: Array.isArray(parsed.plans) && parsed.plans.length > 0
        ? parsed.plans
        : defaultStore.plans,
    };
  } catch {
    return defaultStore;
  }
}

async function writeStore(store: CatalogStore) {
  await ensureStoreDir();
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function getTemplates() {
  try {
    const response = await backendRequest<{ templates?: ProposalTemplate[] }>("/site-state/templates");
    return Array.isArray(response.templates) && response.templates.length > 0
      ? response.templates
      : defaultStore.templates;
  } catch {
    const store = await readStore();
    return store.templates;
  }
}

export async function getTemplateByIdFromStore(id: string) {
  const templates = await getTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export async function saveTemplates(templates: ProposalTemplate[]) {
  const store = await readStore();
  store.templates = templates;
  await writeStore(store);
  try {
    await backendRequest("/site-state/templates", {
      method: "PUT",
      body: JSON.stringify({ templates }),
    });
  } catch {}
  return store.templates;
}

export async function upsertTemplate(template: ProposalTemplate) {
  const store = await readStore();
  const index = store.templates.findIndex((item) => item.id === template.id);

  if (index === -1) {
    store.templates.push(template);
  } else {
    store.templates[index] = template;
  }

  await writeStore(store);
  try {
    await backendRequest("/site-state/templates", {
      method: "POST",
      body: JSON.stringify({ template }),
    });
  } catch {}
  return template;
}

export async function deleteTemplate(id: string) {
  const store = await readStore();
  const nextTemplates = store.templates.filter((template) => template.id !== id);

  if (nextTemplates.length === store.templates.length) {
    return false;
  }

  store.templates = nextTemplates;
  await writeStore(store);
  try {
    await backendRequest(`/site-state/templates/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch {}
  return true;
}

export async function getPlans() {
  try {
    const response = await backendRequest<{ plans?: PublishPlan[] }>("/site-state/plans");
    return Array.isArray(response.plans) && response.plans.length > 0
      ? response.plans
      : defaultStore.plans;
  } catch {
    const store = await readStore();
    return store.plans;
  }
}

export async function getPlanByIdFromStore(id: string) {
  const plans = await getPlans();
  return plans.find((plan) => plan.id === id) ?? null;
}

export async function savePlans(plans: PublishPlan[]) {
  const store = await readStore();
  store.plans = plans;
  await writeStore(store);
  try {
    await backendRequest("/site-state/plans", {
      method: "PUT",
      body: JSON.stringify({ plans }),
    });
  } catch {}
  return store.plans;
}

export async function upsertPlan(plan: PublishPlan) {
  const store = await readStore();
  const index = store.plans.findIndex((item) => item.id === plan.id);

  if (index === -1) {
    store.plans.push(plan);
  } else {
    store.plans[index] = plan;
  }

  await writeStore(store);
  try {
    await backendRequest("/site-state/plans", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
  } catch {}
  return plan;
}

export async function deletePlan(id: string) {
  const store = await readStore();
  const nextPlans = store.plans.filter((plan) => plan.id !== id);

  if (nextPlans.length === store.plans.length) {
    return false;
  }

  store.plans = nextPlans;
  await writeStore(store);
  try {
    await backendRequest(`/site-state/plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch {}
  return true;
}
