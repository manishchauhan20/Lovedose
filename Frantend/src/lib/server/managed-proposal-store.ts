import { backendRequest } from "@/lib/server/backend-api";
import { type ManagedProposal } from "@/lib/managed-proposals";

export async function getManagedProposals() {
  try {
    const response = await backendRequest<{ proposals?: ManagedProposal[] }>("/site-state/proposals");
    return Array.isArray(response.proposals) ? response.proposals : [];
  } catch {
    return [];
  }
}

export async function getManagedProposalById(id: string) {
  try {
    const response = await backendRequest<{ proposal?: ManagedProposal | null }>(`/site-state/proposals/${encodeURIComponent(id)}`);
    return response.proposal ?? null;
  } catch {
    return null;
  }
}

export async function getManagedProposalBySlug(slug: string) {
  try {
    const response = await backendRequest<{ proposal?: ManagedProposal | null }>(`/site-state/proposal-by-slug/${encodeURIComponent(slug)}`);
    return response.proposal ?? null;
  } catch {
    return null;
  }
}

export async function upsertManagedProposal(proposal: ManagedProposal) {
  const method = proposal.id ? "PUT" : "POST";
  const path = proposal.id ? `/site-state/proposals/${encodeURIComponent(proposal.id)}` : "/site-state/proposals";
  const response = await backendRequest<{ proposal?: ManagedProposal }>(path, {
    method,
    body: JSON.stringify({ proposal }),
  });
  return response.proposal ?? null;
}

export async function deleteManagedProposal(id: string) {
  await backendRequest(`/site-state/proposals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
