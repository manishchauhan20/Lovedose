"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { type PublishPlan } from "@/lib/publish-plans";
import {
  clearProposalDraft,
  loadProposalDraft,
  publishProposal,
  saveProposal,
  type CustomerDetails,
  type ProposalData,
} from "@/lib/proposal-storage";

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.03)",
  color: "#f5f0e8",
  fontFamily: "'Syne', sans-serif",
  fontSize: "0.88rem",
  outline: "none",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function templateVisual(template: ProposalTemplate | null) {

  switch (template?.family) {
    case "royal":
      return "linear-gradient(135deg,#2a2313,#9a7a28,#1a160c)";
    case "dreamy":
      return "linear-gradient(135deg,#1d1a11,#7b6320,#0c0b08)";
    default:
      return "linear-gradient(135deg,#241b14,#b58a2a,#1a130d)";
  }
}

export function PublishPlanFlow() {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [plans, setPlans] = useState<PublishPlan[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mailPopup, setMailPopup] = useState("");
  const [mailSuccess, setMailSuccess] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadProposalDraft(),
      fetch("/api/publish-plans").then((res) => res.json()),
      fetch("/api/templates").then((res) => res.json()),
    ])
      .then(([savedProposal, pricingResponse, templateResponse]) => {
        if (cancelled) {
          return;
        }

        if (savedProposal) {
          setProposal(savedProposal);
          if (savedProposal.publishDurationId) {
            setStep(2);
          }
        }

        setPlans(pricingResponse.plans ?? []);
        setTemplates(templateResponse.templates ?? []);
        setPageError("");
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPageError("Required data load nahi hua. Please refresh and try again.");
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTemplate = templates.find((template) => template.id === proposal.templateId) ?? null;
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === proposal.publishDurationId) ?? null,
    [plans, proposal.publishDurationId],
  );
  const accessibleTemplates = useMemo(
    () => (selectedPlan?.allTemplateAccess ? templates : selectedTemplate ? [selectedTemplate] : []),
    [selectedPlan, selectedTemplate, templates],
  );

  const hasBaseProposal = Boolean(
    proposal.boyName.trim() && proposal.girlName.trim() && proposal.message.trim() && proposal.templateId.trim(),
  );

  const choosePlan = (plan: PublishPlan) => {
    const next = {
      ...proposal,
      publishDurationId: plan.id,
      publishDurationLabel: plan.label,
      publishHours: plan.hours,
      publishPrice: plan.price,
      allTemplateAccess: plan.allTemplateAccess,
      purchasedTemplateIds: plan.allTemplateAccess ? templates.map((template) => template.id) : [proposal.templateId],
      publishExpiresAt: "",
    };

    setProposal((current) => ({
      ...current,
      ...next,
    }));
    void saveProposal(next);
    setStep(2);
    setMailPopup(`Plan selected: ${plan.label}`);
  };

  const updateCustomer = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) => {
    setProposal((current) => ({
      ...current,
      customerDetails: {
        ...current.customerDetails,
        [key]: value,
      },
    }));
  };

  const submitFlow = async () => {
    if (!selectedPlan) {
      return;
    }

    setSubmitting(true);
    setMailPopup("");
    setMailSuccess(false);
    const response = await fetch("/api/publish-plan/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: selectedPlan.id,
        proposal,
      }),
    });

    if (!response.ok) {
      setSubmitting(false);
      setMailSuccess(false);
      setMailPopup("Mail send nahi hua. Please try again.");
      return;
    }

    const result = await response.json();
    const nextProposal = result.proposal as ProposalData;

    await publishProposal(nextProposal);
    await clearProposalDraft();
    setProposal(nextProposal);
    setMailSuccess(Boolean(result.emailSent));
    setMailPopup(
      result.emailSent
        ? `Mail sent successfully to ${nextProposal.customerDetails.email}. Inbox me dashboard aur proposal dono links mil jayenge.`
        : result.message || "Proposal saved, but mail could not be sent.",
    );
    window.setTimeout(() => {
      router.push("/proposal");
    }, 1800);
  };

  const canSubmit =
    !submitting &&
    Boolean(
      proposal.customerDetails.fullName.trim() &&
        proposal.customerDetails.email.trim() &&
        proposal.customerDetails.phone.trim() &&
        proposal.customerDetails.password.trim(),
    );

  if (!loaded) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b0b", color: "#f5f0e8" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>Loading publish plans...</p>
      </main>
    );
  }

  if (!hasBaseProposal) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b0b", color: "#f5f0e8", padding: "2rem" }}>
        <div style={{ maxWidth: 460, textAlign: "center", padding: "2.5rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, marginBottom: "0.8rem" }}>Complete the form first</h1>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.84rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Template and publish plan flow tabhi open hoga jab proposal form aur template dono selected hon.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" style={{ padding: "12px 20px", borderRadius: 999, textDecoration: "none", color: "#d4af37", border: "1px solid rgba(212,175,55,0.28)" }}>Open Form</Link>
            <Link href="/templates" style={{ padding: "12px 20px", borderRadius: 999, textDecoration: "none", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>Choose Template</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top,#1d170b 0%,#0b0b0b 48%,#000 100%)", color: "#f5f0e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Syne:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::placeholder{color:rgba(255,255,255,0.24)}
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/templates" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem" }}>
              Back to templates
            </Link>
            {proposal.customerDetails.email && (
              <Link href="/dashboard" style={{ color: "#d4af37", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem" }}>
                Dashboard
              </Link>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2].map((item) => (
              <div key={item} style={{ width: item === step ? 28 : 8, height: 8, borderRadius: 999, background: item === step ? "#d4af37" : "rgba(255,255,255,0.12)" }} />
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(320px,0.75fr)", gap: "1.5rem", alignItems: "start" }}>
          <section style={{ padding: "2rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            {step === 1 ? (
              <>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.9rem" }}>
                  Step 1 / Publish Duration
                </p>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1.05, marginBottom: "0.8rem" }}>
                  Kitne time ke liye
                  <br />
                  <em style={{ color: "#d4af37" }}>site publish karni hai?</em>
                </h1>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: "1.8rem" }}>
                  24 hours tak single selected template rahega. 24 hours se upar ka plan loge to sab templates unlock ho jayenge.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "1rem" }}>
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => choosePlan(plan)}
                      style={{
                        textAlign: "left",
                        padding: "1.2rem",
                        borderRadius: 22,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
                        color: "#f5f0e8",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: "0.9rem" }}>
                        <div>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.2rem" }}>{plan.label}</p>
                          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{plan.description}</p>
                        </div>
                        {plan.allTemplateAccess && (
                          <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.24)", fontFamily: "'Syne', sans-serif", fontSize: "0.64rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#d4af37" }}>
                            All Templates
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", color: "#d4af37", letterSpacing: "0.06em" }}>{formatPrice(plan.price)}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: "1.6rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.9rem" }}>
                      Step 2 / Customer Details
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, lineHeight: 1.05 }}>
                      Buyer details fill karo,
                      <br />
                      <em style={{ color: "#d4af37" }}>phir preview open hoga</em>
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.75)", cursor: "pointer" }}
                  >
                    Change Plan
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <input value={proposal.customerDetails.fullName} onChange={(e) => updateCustomer("fullName", e.target.value)} placeholder="Full name" style={inputStyle} />
                  <input value={proposal.customerDetails.email} onChange={(e) => updateCustomer("email", e.target.value)} placeholder="Email address" style={inputStyle} />
                  <input value={proposal.customerDetails.phone} onChange={(e) => updateCustomer("phone", e.target.value)} placeholder="Phone number" style={inputStyle} />
                  <input value={proposal.customerDetails.occasion} onChange={(e) => updateCustomer("occasion", e.target.value)} placeholder="Occasion" style={inputStyle} />
                </div>
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={proposal.customerDetails.password}
                    onChange={(e) => updateCustomer("password", e.target.value)}
                    placeholder="Set password"
                    style={{ ...inputStyle, paddingRight: 100 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 12,
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {/* <textarea value={proposal.customerDetails.notes} onChange={(e) => updateCustomer("notes", e.target.value)} placeholder="Extra notes for this publish order" rows={5} style={{ ...inputStyle, resize: "vertical", marginBottom: "1.4rem" }} /> */}
                {pageError && (
                  <div style={{
                    marginBottom: "1rem",
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: "1px solid rgba(255,120,120,0.24)",
                    background: "rgba(255,120,120,0.08)",
                    color: "#f5f0e8",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                  }}>
                    {pageError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMailPopup("");
                    setMailSuccess(false);
                    setShowPublishPopup(true);
                  }}
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: 999,
                    border: "none",
                    background: submitting ? "rgba(212,175,55,0.2)" : "linear-gradient(135deg,#d4af37,#9a7420)",
                    color: submitting ? "rgba(255,255,255,0.6)" : "#140f05",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {submitting ? "Saving..." : "Continue to Final Proposal"}
                </button>
                {mailPopup && (
                  <div style={{
                    marginTop: "1rem",
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: mailSuccess ? "1px solid rgba(212,175,55,0.24)" : "1px solid rgba(255,120,120,0.24)",
                    background: mailSuccess ? "rgba(212,175,55,0.08)" : "rgba(255,120,120,0.08)",
                    color: "#f5f0e8",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                  }}>
                    {mailPopup}
                  </div>
                )}
              </>
            )}
          </section>

          <aside style={{ padding: "1.3rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", position: "sticky", top: 24 }}>
            <div style={{ borderRadius: 24, overflow: "hidden", background: templateVisual(selectedTemplate), minHeight: 220, padding: "1.2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(0,0,0,0.28)", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: "0.7rem" }}>
                  {selectedTemplate?.relationshipType ?? "Template"}
                </span>
                {selectedPlan?.allTemplateAccess && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.18)", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    All Access
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>
                  Selected Template
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, lineHeight: 1.05 }}>{selectedTemplate?.name}</h2>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.75)", marginTop: "0.45rem" }}>{selectedTemplate?.tagline}</p>
              </div>
            </div>

            <div style={{ padding: "1.1rem", borderRadius: 22, border: "1px solid rgba(212,175,55,0.14)", background: "rgba(212,175,55,0.05)", marginBottom: "1rem" }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.8rem" }}>
                Pricing Summary
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.72)", marginBottom: "0.45rem" }}>
                <span>Publish Duration</span>
                <span>{selectedPlan?.label ?? "Not selected"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.72)", marginBottom: "0.45rem" }}>
                <span>Template Access</span>
                <span>{selectedPlan?.allTemplateAccess ? "All templates" : "Selected template only"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Syne', sans-serif", fontSize: "1rem", color: "#f5f0e8", marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span>Total Price</span>
                <span>{formatPrice(selectedPlan?.price ?? 0)}</span>
              </div>
            </div>

            <div style={{ padding: "1.1rem", borderRadius: 22, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.52)", marginBottom: "0.8rem" }}>
                Templates Included
              </p>
              <div style={{ display: "grid", gap: "0.7rem" }}>
                {accessibleTemplates.map((template) => (
                  <div key={template.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: "0.7rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>{template.name}</p>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{template.tagline}</p>
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", color: "#d4af37" }}>{template.family}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showPublishPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
            zIndex: 40,
          }}
        >
          <div
            style={{
              width: "min(680px,100%)",
              borderRadius: 28,
              border: "1px solid rgba(212,175,55,0.2)",
              background: "linear-gradient(180deg,rgba(24,18,8,0.98),rgba(8,8,8,0.98))",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              padding: "1.6rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.7rem" }}>
                  Publish Confirmation
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, lineHeight: 1.05 }}>
                  Mail me link jayega,
                  <br />
                  <em style={{ color: "#d4af37" }}>ab public karna chahte ho?</em>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishPopup(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                x
              </button>
            </div>

            <div style={{ padding: "1rem", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: "1rem" }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.56)", marginBottom: "0.9rem" }}>
                Mail Content Preview
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "#f5f0e8", marginBottom: "0.6rem" }}>
                Hi {proposal.customerDetails.fullName || "there"}, your premium proposal setup is complete.
              </p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}>
                Mail pe dashboard aur proposal dono ke links chale jayenge.
                <br />
                Template: {selectedTemplate?.name ?? "Selected template"}
                <br />
                Plan: {selectedPlan?.label ?? "Selected plan"}
                <br />
                Email will be sent to: {proposal.customerDetails.email || "customer email"}
                <br />
                Links inside mail: Dashboard and Proposal
              </p>
            </div>

            <div style={{ padding: "1rem", borderRadius: 20, border: "1px solid rgba(212,175,55,0.16)", background: "rgba(212,175,55,0.06)", marginBottom: "1.4rem" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#f5f0e8" }}>
                Agar `Yes, Publish` karoge to proposal public hoga aur mail send hoga:
              </p>
              <p style={{ marginTop: "0.55rem", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", lineHeight: 1.8, color: "#f5f0e8" }}>
                Mail sent successfully to {proposal.customerDetails.email || "customer email"}. Inbox me dashboard aur proposal dono links mil jayenge.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowPublishPopup(false)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.78)",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPublishPopup(false);
                  void submitFlow();
                }}
                disabled={submitting}
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: submitting ? "rgba(212,175,55,0.2)" : "linear-gradient(135deg,#d4af37,#9a7420)",
                  color: submitting ? "rgba(255,255,255,0.6)" : "#140f05",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {submitting ? "Publishing..." : "Yes, Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
      {submitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              minWidth: 260,
              borderRadius: 24,
              border: "1px solid rgba(212,175,55,0.18)",
              background: "rgba(12,10,6,0.96)",
              padding: "1.4rem 1.6rem",
              textAlign: "center",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(212,175,55,0.2)", borderTopColor: "#d4af37", margin: "0 auto 0.9rem", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.45rem" }}>
              Publishing
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#f5f0e8" }}>
              Check your mail for the links to dashboard and proposal.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default PublishPlanFlow;
