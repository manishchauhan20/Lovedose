export type RelationshipType = "GF" | "Crush" | "Wife";

export type PhotoItem = {
  id: string;
  image: string;
  caption: string;
};

export type PublishDurationId =
  | "1h"
  | "3h"
  | "6h"
  | "12h"
  | "24h"
  | "1m"
  | "3m"
  | "6m"
  | "1y";

export type CustomerDetails = {
  fullName: string;
  email: string;
  phone: string;
  occasion: string;
  notes: string;
  password: string;
};

export type ProposalData = {
  boyName: string;
  girlName: string;
  message: string;
  relationshipType: RelationshipType;
  templateId: string;
  howWeMet: string;
  firstMeetingDate: string;
  nickname: string;
  whyILoveYou: string;
  futureDreams: string;
  heroImage: string;
  heroImageCaption: string;
  gallery: PhotoItem[];
  voiceNote: string;
  publishDurationId: PublishDurationId | "";
  publishDurationLabel: string;
  publishHours: number;
  publishPrice: number;
  allTemplateAccess: boolean;
  purchasedTemplateIds: string[];
  publishExpiresAt: string;
  customerDetails: CustomerDetails;
};

export const proposalStorageKey = "love-proposal-generator";
export const publishedProposalStorageKey = "love-proposal-generator-published";
const draftDatabaseName = "lovedose-local-draft";
const draftStoreName = "proposalDraft";
const draftRecordKey = "current";

export function normalizeProposal(data: Partial<ProposalData> | null | undefined): ProposalData | null {
  if (!data) {
    return null;
  }

  return {
    boyName: data.boyName ?? "",
    girlName: data.girlName ?? "",
    message: data.message ?? "",
    relationshipType: data.relationshipType ?? "GF",
    templateId: data.templateId ?? "",
    howWeMet: data.howWeMet ?? "",
    firstMeetingDate: data.firstMeetingDate ?? "",
    nickname: data.nickname ?? "",
    whyILoveYou: data.whyILoveYou ?? "",
    futureDreams: data.futureDreams ?? "",
    heroImage: data.heroImage ?? "",
    heroImageCaption: data.heroImageCaption ?? "",
    gallery: data.gallery ?? [],
    voiceNote: data.voiceNote ?? "",
    publishDurationId: data.publishDurationId ?? "",
    publishDurationLabel: data.publishDurationLabel ?? "",
    publishHours: data.publishHours ?? 0,
    publishPrice: data.publishPrice ?? 0,
    allTemplateAccess: data.allTemplateAccess ?? false,
    purchasedTemplateIds: data.purchasedTemplateIds ?? [],
    publishExpiresAt: data.publishExpiresAt ?? "",
    customerDetails: {
      fullName: data.customerDetails?.fullName ?? "",
      email: data.customerDetails?.email ?? "",
      phone: data.customerDetails?.phone ?? "",
      occasion: data.customerDetails?.occasion ?? "",
      notes: data.customerDetails?.notes ?? "",
      password: data.customerDetails?.password ?? "",
    },
  };
}

async function requestProposal(
  path: string,
  init?: RequestInit,
): Promise<ProposalData | null> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Request failed for ${path}`);
  }

  const payload = (await response.json()) as { proposal?: ProposalData | null };
  return normalizeProposal(payload.proposal ?? null);
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

async function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(draftDatabaseName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(draftStoreName)) {
        database.createObjectStore(draftStoreName);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open local draft database"));
  });
}

async function getLocalDraft() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const database = await openDraftDatabase();

  return new Promise<ProposalData | null>((resolve, reject) => {
    const transaction = database.transaction(draftStoreName, "readonly");
    const store = transaction.objectStore(draftStoreName);
    const request = store.get(draftRecordKey);

    request.onsuccess = () => resolve(normalizeProposal((request.result as ProposalData | null | undefined) ?? null));
    request.onerror = () => reject(request.error ?? new Error("Failed to read local draft"));
  });
}

async function setLocalDraft(data: ProposalData) {
  if (!canUseBrowserStorage()) {
    return normalizeProposal(data);
  }

  const normalized = normalizeProposal(data);

  if (!normalized) {
    throw new Error("Invalid proposal data");
  }

  const database = await openDraftDatabase();

  return new Promise<ProposalData>((resolve, reject) => {
    const transaction = database.transaction(draftStoreName, "readwrite");
    const store = transaction.objectStore(draftStoreName);
    const request = store.put(normalized, draftRecordKey);

    request.onsuccess = () => resolve(normalized);
    request.onerror = () => reject(request.error ?? new Error("Failed to save local draft"));
  });
}

async function clearLocalDraft() {
  if (!canUseBrowserStorage()) {
    return;
  }

  const database = await openDraftDatabase();

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(draftStoreName, "readwrite");
    const store = transaction.objectStore(draftStoreName);
    const request = store.delete(draftRecordKey);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to clear local draft"));
  });
}

async function saveProposalTo(path: string, data: ProposalData) {
  const normalized = normalizeProposal(data);

  if (!normalized) {
    throw new Error("Invalid proposal data");
  }

  const proposal = await requestProposal(path, {
    method: "PUT",
    body: JSON.stringify({ proposal: normalized }),
  });

  if (!proposal) {
    throw new Error("Failed to save proposal");
  }

  return proposal;
}

export async function saveProposal(data: ProposalData) {
  return setLocalDraft(data);
}

export async function publishProposal(data: ProposalData) {
  return saveProposalTo("/api/proposal/published", data);
}

export async function loadProposalDraft() {
  return getLocalDraft();
}

export async function loadPublishedProposal() {
  return requestProposal("/api/proposal/published");
}

export async function loadProposal() {
  const draft = await loadProposalDraft();

  if (draft) {
    return draft;
  }

  return loadPublishedProposal();
}

export async function clearProposalDraft() {
  await clearLocalDraft();
}
