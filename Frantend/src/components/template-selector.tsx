"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  loadProposalDraft,
  saveProposal,
  type ProposalData,
} from "@/lib/proposal-storage";
import { type ManagedProposal } from "@/lib/managed-proposals";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { TemplateCatalog } from "@/components/template-catalog";

const emptyState: ProposalData = {
  boyName: "",
  girlName: "",
  message: "",
  relationshipType: "GF",
  templateId: "",
  howWeMet: "",
  firstMeetingDate: "",
  nickname: "",
  whyILoveYou: "",
  futureDreams: "",
  heroImage: "",
  heroImageCaption: "",
  gallery: [],
  voiceNote: "",
  publishDurationId: "",
  publishDurationLabel: "",
  publishHours: 0,
  publishPrice: 0,
  allTemplateAccess: false,
  purchasedTemplateIds: [],
  publishExpiresAt: "",
  customerDetails: {
    fullName: "",
    email: "",
    phone: "",
    occasion: "",
    notes: "",
    password: "",
  },
};

export function TemplateSelector() {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingTemplateId, setSavingTemplateId] = useState("");
  const [managedProposals, setManagedProposals] = useState<ManagedProposal[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function jsonOrEmpty<T>(input: RequestInfo | URL): Promise<T> {
      try {
        const response = await fetch(input, { cache: "no-store" });
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
      } catch {
        return {} as T;
      }
    }

    Promise.all([
      loadProposalDraft(),
      jsonOrEmpty<{ templates?: ProposalTemplate[] }>("/api/templates"),
      jsonOrEmpty<{ proposals?: ManagedProposal[] }>("/api/proposals"),
    ]).then(([data, templateResponse, managedResponse]) => {
      if (cancelled) {
        return;
      }

      if (data) {
        setProposal(data);
      }

      setTemplates(templateResponse.templates ?? []);
      setManagedProposals(managedResponse.proposals ?? []);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasProposal = Boolean(proposal.boyName.trim() && proposal.girlName.trim() && proposal.message.trim());
  const activeTemplate = templates.find((template) => template.id === proposal.templateId) ?? null;

  const saveTemplateSelection = async (templateId: string) => {
    if (savingTemplateId) {
      return null;
    }

    setSavingTemplateId(templateId);
    const next: ProposalData = proposal.allTemplateAccess
      ? { ...proposal, templateId }
      : {
          ...proposal,
          templateId,
          publishDurationId: "",
          publishDurationLabel: "",
          publishHours: 0,
          publishPrice: 0,
          allTemplateAccess: false,
          publishExpiresAt: "",
        };

    try {
      await saveProposal(next);
      setProposal(next);
      return next;
    } finally {
      setSavingTemplateId("");
    }
  };

  const viewTemplate = async (templateId: string) => {
    const next = await saveTemplateSelection(templateId);
    if (!next) {
      return;
    }

    router.push("/proposal?preview=1");
  };

  const purchaseTemplate = async (templateId: string) => {
    const next = await saveTemplateSelection(templateId);
    if (!next) {
      return;
    }

    router.push("/publish-plan");
  };

  if (!loaded) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f0f0f", color: "#f5f0e8" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>Preparing templates...</p>
      </main>
    );
  }

  if (!hasProposal) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f0f0f", color: "#f5f0e8", padding: "2rem" }}>
        <div style={{ maxWidth: 440, textAlign: "center", padding: "2.5rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, marginBottom: "0.8rem" }}>No proposal found</h1>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: "1.4rem" }}>
            First complete the proposal form by entering your names, a message, and selecting a relationship type.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 18px", borderRadius: 999, textDecoration: "none", color: "#d4af37", border: "1px solid rgba(212,175,55,0.28)" }}>
            Open Form
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top,#1a1409 0%,#0f0f0f 48%,#050505 100%)", color: "#f5f0e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Syne:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={{ textDecoration: "none", color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem" }}>
              ← Back
            </Link>
            {proposal.customerDetails.email && (
              <Link href="/dashboard" style={{ textDecoration: "none", color: "#d4af37", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem" }}>
                Dashboard
              </Link>
            )}
          </div>
          <div style={{ color: "rgba(255,255,255,0.56)", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem" }}>
            {proposal.boyName} & {proposal.girlName}
          </div>
        </div>

        <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.34em", textTransform: "uppercase", color: "#d4af37", marginBottom: "1rem" }}>
            Template Selection
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.6rem,6vw,4.8rem)", fontWeight: 300, lineHeight: 1.02, marginBottom: "0.9rem" }}>
            Pehle template dekho,
            <br />
            <em style={{ color: "#d4af37" }}>phir purchase karo</em>
          </h1>
          <p style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.46)", lineHeight: 1.8 }}>
            Har template ke niche 2 options hain. `View Template` se preview open hoga. `Purchase Template` se publish plan page open hoga aur aage ka process continue hoga.
          </p>
        </header>

        {activeTemplate && (
          <div style={{ marginBottom: "2rem", padding: "1rem 1.2rem", borderRadius: 18, border: "1px solid rgba(212,175,55,0.16)", background: "rgba(212,175,55,0.05)" }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.35rem" }}>
              Current Selection
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>
              {activeTemplate.name}
            </p>
          </div>
        )}

        {managedProposals.length > 0 && (
          <section style={{ marginBottom: "2rem", padding: "1.2rem", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#d4af37", marginBottom: "1rem" }}>
              Dynamic Proposal Previews
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "1rem" }}>
              {managedProposals.map((item) => (
                <div key={item.id} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ height: 130, background: item.coverImage ? `linear-gradient(rgba(8,6,4,0.18), rgba(8,6,4,0.72)), url(${item.coverImage}) center/cover` : "linear-gradient(135deg,#261c13,#b58a2a,#16100a)" }} />
                  <div style={{ padding: "0.9rem" }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: "0.35rem" }}>{item.proposalType}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", marginBottom: "0.8rem" }}>{item.title}</p>
                    <Link href={`/proposal?managed=${encodeURIComponent(item.slug)}`} style={{ textDecoration: "none", color: "#d4af37", fontFamily: "'Syne', sans-serif", fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Open Proposal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <TemplateCatalog
          templates={templates}
          selectedTemplateId={proposal.templateId}
          busyTemplateId={savingTemplateId}
          onView={(templateId) => void viewTemplate(templateId)}
          onPrimaryAction={(templateId) => void purchaseTemplate(templateId)}
          getPrimaryLabel={() => "Purchase Template"}
        />
      </div>
    </main>
  );
}

export default TemplateSelector;
