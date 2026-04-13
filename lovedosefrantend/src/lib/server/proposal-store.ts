import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import { backendRequest } from "@/lib/server/backend-api";

type ProposalStore = {
  draft: ProposalData | null;
  published: ProposalData | null;
};

const storePath = path.join(process.cwd(), "data", "proposal-store.json");

const emptyStore: ProposalStore = {
  draft: null,
  published: null,
};

async function ensureStoreDir() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

async function readStore(): Promise<ProposalStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ProposalStore>;

    return {
      draft: normalizeProposal(parsed.draft ?? null),
      published: normalizeProposal(parsed.published ?? null),
    };
  } catch {
    return emptyStore;
  }
}

async function writeStore(store: ProposalStore) {
  await ensureStoreDir();
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function getDraftProposal() {
  try {
    const response = await backendRequest<{ proposal?: ProposalData | null }>("/site-state/proposal/draft");
    return normalizeProposal(response.proposal ?? null);
  } catch {
    const store = await readStore();
    return store.draft;
  }
}

export async function saveDraftProposal(proposal: ProposalData) {
  const store = await readStore();
  store.draft = normalizeProposal(proposal);
  await writeStore(store);
  try {
    await backendRequest("/site-state/proposal/draft", {
      method: "PUT",
      body: JSON.stringify({ proposal: store.draft }),
    });
  } catch {}
  return store.draft;
}

export async function clearDraftProposal() {
  const store = await readStore();
  store.draft = null;
  await writeStore(store);
  try {
    await backendRequest("/site-state/proposal/draft", { method: "DELETE" });
  } catch {}
}

export async function getPublishedProposal() {
  try {
    const response = await backendRequest<{ proposal?: ProposalData | null }>("/site-state/proposal/published");
    return normalizeProposal(response.proposal ?? null);
  } catch {
    const store = await readStore();
    return store.published;
  }
}

export async function savePublishedProposal(proposal: ProposalData) {
  const store = await readStore();
  store.published = normalizeProposal(proposal);
  await writeStore(store);
  try {
    await backendRequest("/site-state/proposal/published", {
      method: "PUT",
      body: JSON.stringify({ proposal: store.published }),
    });
  } catch {}
  return store.published;
}

export async function clearPublishedProposal() {
  const store = await readStore();
  store.published = null;
  await writeStore(store);
  try {
    await backendRequest("/site-state/proposal/published", { method: "DELETE" });
  } catch {}
}
