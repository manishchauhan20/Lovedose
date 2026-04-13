import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import { backendRequest } from "@/lib/server/backend-api";

export type CustomerRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  occasion: string;
  notes: string;
  templateId: string;
  templateName: string;
  planId: string;
  planLabel: string;
  planHours: number;
  planPrice: number;
  publishExpiresAt: string;
  allTemplateAccess: boolean;
  loginCount: number;
  firstLoginAt: string;
  lastLoginAt: string;
  formCompletion: number;
  formStage: string;
  lastAction: string;
  recordType: "draft" | "published";
  registeredAt: string;
  lastActionAt: string;
  createdAt: string;
  updatedAt: string;
  proposalSnapshot: ProposalData | null;
};

type CustomerStore = {
  customers: CustomerRecord[];
};

const storePath = path.join(process.cwd(), "data", "customer-store.json");

const emptyStore: CustomerStore = {
  customers: [],
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createCustomerId(email: string) {
  return normalizeEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "customer";
}

function createFallbackCustomerId(proposal: ProposalData) {
  const parts = [
    proposal.customerDetails.fullName,
    proposal.customerDetails.phone,
    proposal.boyName,
    proposal.girlName,
  ]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .join("-");

  return parts.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `guest-${Date.now()}`;
}

function calculateFormCompletion(proposal: ProposalData) {
  const checks = [
    proposal.boyName,
    proposal.girlName,
    proposal.message,
    proposal.templateId,
    proposal.howWeMet,
    proposal.firstMeetingDate,
    proposal.nickname,
    proposal.whyILoveYou,
    proposal.futureDreams,
    proposal.heroImage,
    proposal.heroImageCaption,
    proposal.voiceNote,
    proposal.publishDurationId,
    proposal.customerDetails.fullName,
    proposal.customerDetails.email,
    proposal.customerDetails.phone,
    proposal.customerDetails.occasion,
    proposal.customerDetails.password,
  ];

  const galleryScore = proposal.gallery.filter((item) => item.image).length > 0 ? 1 : 0;
  const filled = checks.filter((value) => String(value ?? "").trim().length > 0).length + galleryScore;
  const total = checks.length + 1;
  return Math.round((filled / total) * 100);
}

function detectFormStage(proposal: ProposalData) {
  if (proposal.customerDetails.fullName || proposal.publishDurationId) {
    return "publish-plan";
  }

  if (proposal.voiceNote) {
    return "voice";
  }

  if (proposal.heroImage || proposal.gallery.length > 0) {
    return "memories";
  }

  if (proposal.message) {
    return "message";
  }

  if (proposal.howWeMet || proposal.whyILoveYou || proposal.futureDreams) {
    return "story";
  }

  if (proposal.boyName || proposal.girlName || proposal.nickname) {
    return "names";
  }

  return "started";
}

async function ensureStoreDir() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

async function readStore(): Promise<CustomerStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CustomerStore>;
    return {
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
    };
  } catch {
    return emptyStore;
  }
}

async function writeStore(store: CustomerStore) {
  await ensureStoreDir();
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function getCustomers() {
  try {
    const response = await backendRequest<{ customers?: CustomerRecord[] }>("/site-state/customers");
    const customers = Array.isArray(response.customers) ? response.customers : [];
    return [...customers].sort((a, b) => {
      const left = a.updatedAt || a.createdAt;
      const right = b.updatedAt || b.createdAt;
      return right.localeCompare(left);
    });
  } catch {}

  const store = await readStore();
  return [...store.customers].sort((a, b) => {
    const left = a.updatedAt || a.createdAt;
    const right = b.updatedAt || b.createdAt;
    return right.localeCompare(left);
  });
}

export async function getCustomerById(id: string) {
  try {
    const response = await backendRequest<{ customer?: CustomerRecord | null }>(`/site-state/customers/${encodeURIComponent(id)}`);
    return response.customer ?? null;
  } catch {
    const store = await readStore();
    return store.customers.find((customer) => customer.id === id) ?? null;
  }
}

export async function getCustomerByEmail(email: string) {
  const store = await readStore();
  const normalized = normalizeEmail(email);
  return store.customers.find((customer) => normalizeEmail(customer.email) === normalized) ?? null;
}

export async function deleteCustomer(id: string) {
  const store = await readStore();
  const nextCustomers = store.customers.filter((customer) => customer.id !== id);

  if (nextCustomers.length === store.customers.length) {
    return false;
  }

  store.customers = nextCustomers;
  await writeStore(store);
  try {
    await backendRequest(`/site-state/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {}
  return true;
}

export async function upsertCustomerFromProposal(
  proposalInput: ProposalData,
  options?: { templateName?: string; recordType?: "draft" | "published"; lastAction?: string },
) {
  const proposal = normalizeProposal(proposalInput);

  if (!proposal) {
    throw new Error("Invalid proposal data.");
  }

  const store = await readStore();
  const now = new Date().toISOString();
  const email = normalizeEmail(proposal.customerDetails.email);

  if (!email) {
    throw new Error("Customer email is required.");
  }

  const fallbackId = createFallbackCustomerId(proposal);
  const existingIndex = store.customers.findIndex((customer) => {
    if (email && normalizeEmail(customer.email) === email) {
      return true;
    }

    return customer.id === fallbackId;
  });
  const existing = existingIndex >= 0 ? store.customers[existingIndex] : null;
  const recordType = options?.recordType ?? "published";
  const formCompletion = calculateFormCompletion(proposal);
  const formStage = detectFormStage(proposal);
  const record: CustomerRecord = {
    id: existing?.id ?? (email ? createCustomerId(email) : fallbackId),
    fullName: proposal.customerDetails.fullName,
    email,
    phone: proposal.customerDetails.phone,
    occasion: proposal.customerDetails.occasion,
    notes: proposal.customerDetails.notes,
    templateId: proposal.templateId,
    templateName: options?.templateName ?? existing?.templateName ?? proposal.templateId,
    planId: proposal.publishDurationId,
    planLabel: proposal.publishDurationLabel,
    planHours: proposal.publishHours,
    planPrice: proposal.publishPrice,
    publishExpiresAt: proposal.publishExpiresAt,
    allTemplateAccess: proposal.allTemplateAccess,
    loginCount: existing?.loginCount ?? 0,
    firstLoginAt: existing?.firstLoginAt ?? "",
    lastLoginAt: existing?.lastLoginAt ?? "",
    formCompletion,
    formStage,
    lastAction: options?.lastAction ?? (recordType === "published" ? "published proposal" : "saved draft"),
    recordType,
    registeredAt: existing?.registeredAt ?? now,
    lastActionAt: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    proposalSnapshot: proposal,
  };

  if (existingIndex >= 0) {
    store.customers[existingIndex] = record;
  } else {
    store.customers.push(record);
  }

  await writeStore(store);
  try {
    await backendRequest("/site-state/customers/upsert", {
      method: "POST",
      body: JSON.stringify({ customer: record }),
    });
  } catch {}
  return record;
}

export async function recordCustomerLogin(email: string) {
  const store = await readStore();
  const normalized = normalizeEmail(email);
  const index = store.customers.findIndex((customer) => normalizeEmail(customer.email) === normalized);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const current = store.customers[index];
  store.customers[index] = {
    ...current,
    loginCount: current.loginCount + 1,
    firstLoginAt: current.firstLoginAt || now,
    lastLoginAt: now,
    updatedAt: now,
  };

  await writeStore(store);
  try {
    await backendRequest("/site-state/customers/upsert", {
      method: "POST",
      body: JSON.stringify({ customer: store.customers[index] }),
    });
  } catch {}
  return store.customers[index];
}

export function getCustomerStatus(customer: CustomerRecord) {
  if (!customer.publishExpiresAt) {
    return "draft";
  }

  return new Date(customer.publishExpiresAt).getTime() > Date.now() ? "active" : "expired";
}
