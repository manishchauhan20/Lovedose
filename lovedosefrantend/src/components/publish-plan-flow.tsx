"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
        if (cancelled) return;
        if (savedProposal) {
          setProposal(savedProposal);
          if (savedProposal.publishDurationId) setStep(2);
        }
        setPlans(pricingResponse.plans ?? []);
        setTemplates(templateResponse.templates ?? []);
        setPageError("");
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPageError("Required data load nahi hua. Please refresh and try again.");
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, []);

  const selectedTemplate = templates.find((t) => t.id === proposal.templateId) ?? null;
  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === proposal.publishDurationId) ?? null,
    [plans, proposal.publishDurationId]
  );
  const accessibleTemplates = useMemo(
    () => (selectedPlan?.allTemplateAccess ? templates : selectedTemplate ? [selectedTemplate] : []),
    [selectedPlan, selectedTemplate, templates]
  );

  const hasBaseProposal = Boolean(
    proposal.boyName.trim() && proposal.girlName.trim() && proposal.message.trim() && proposal.templateId.trim()
  );

  const choosePlan = (plan: PublishPlan) => {
    const next = {
      ...proposal,
      publishDurationId: plan.id,
      publishDurationLabel: plan.label,
      publishHours: plan.hours,
      publishPrice: plan.price,
      allTemplateAccess: plan.allTemplateAccess,
      purchasedTemplateIds: plan.allTemplateAccess ? templates.map((t) => t.id) : [proposal.templateId],
      publishExpiresAt: "",
    };
    setProposal(next);
    void saveProposal(next);
    setStep(2);
    setMailPopup(`Plan selected: ${plan.label}`);
  };

  const updateCustomer = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) => {
    setProposal((current) => ({
      ...current,
      customerDetails: { ...current.customerDetails, [key]: value },
    }));
  };

  const submitFlow = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setMailPopup("");
    setMailSuccess(false);

    const response = await fetch("/api/publish-plan/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: selectedPlan.id, proposal }),
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
        : result.message || "Proposal saved, but mail could not be sent."
    );
    window.setTimeout(() => router.push("/proposal"), 1800);
  };

  const canSubmit =
    !submitting &&
    Boolean(
      proposal.customerDetails.fullName.trim() &&
        proposal.customerDetails.email.trim() &&
        proposal.customerDetails.phone.trim() &&
        proposal.customerDetails.password.trim()
    );

  if (!loaded) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#0b0b0b] text-[#f5f0e8] px-4">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif italic text-lg md:text-xl text-center"
        >
          Loading publish plans...
        </motion.p>
      </main>
    );
  }

  if (!hasBaseProposal) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#0b0b0b] text-[#f5f0e8] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center p-6 md:p-10 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-light mb-4">Complete the form first</h1>
          <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed mb-8">
            Template and publish plan flow tabhi open hoga jab proposal form aur template dono selected hon.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-full text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/10 transition-all text-sm font-medium"
            >
              Open Form
            </Link>
            <Link 
              href="/templates" 
              className="px-6 py-3 rounded-full text-white/80 border border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
            >
              Choose Template
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1d170b_0%,#0b0b0b_48%,#000_100%)] text-[#f5f0e8] overflow-x-hidden">
      {/* Mobile-First Responsive Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-20 md:pb-24">
        
        {/* Header - Responsive Flex/Grid */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/templates" className="text-white/70 hover:text-white transition-colors font-sans">
              ← Back to templates
            </Link>
            {proposal.customerDetails.email && (
              <Link href="/dashboard" className="text-[#d4af37] hover:text-[#e8c547] transition-colors font-sans font-medium">
                Dashboard →
              </Link>
            )}
          </div>
          
          {/* Step Indicators - Responsive */}
          <div className="flex gap-2">
            {[1, 2].map((item) => (
              <motion.div 
                key={item} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  item === step ? "w-8 md:w-10 bg-[#d4af37]" : "w-2 bg-white/20"
                }`}
                layout
              />
            ))}
          </div>
        </div>

        {/* Main Grid - Responsive: Mobile Stack, Desktop Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 lg:gap-8 items-start">
          
          {/* Left Column - Main Content */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 md:p-8 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <span className="inline-block text-xs font-sans tracking-[0.2em] uppercase text-[#d4af37] mb-3">
                    Step 1 / Publish Duration
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-3">
                    Choose a plan for, <br className="hidden sm:block" />
                    <em className="text-[#d4af37] not-italic"> How long to publish?</em>
                  </h1>
                  
                  {/* Plans Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                    {plans.map((plan) => (
                      <motion.button
                        key={plan.id}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => choosePlan(plan)}
                        className="group text-left p-5 md:p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] hover:border-[#d4af37]/30 transition-all"
                      >
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <div>
                            <h3 className="font-serif text-xl md:text-2xl mb-1">{plan.label}</h3>
                            <p className="font-sans text-xs md:text-sm text-white/50 leading-relaxed">{plan.description}</p>
                          </div>
                          {plan.allTemplateAccess && (
                            <span className="shrink-0 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[10px] md:text-xs font-sans font-bold tracking-wider uppercase">
                              All
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-lg md:text-xl text-[#d4af37] font-semibold tracking-wide">
                          {formatPrice(plan.price)}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="inline-block text-xs font-sans tracking-[0.2em] uppercase text-[#d4af37] mb-2">
                        Step 2 / Customer Details
                      </span>
                      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
                        Buyer details, <br className="hidden sm:block" />
                        <em className="text-[#d4af37] not-italic">phir preview open</em>
                      </h1>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition-all text-sm font-sans shrink-0"
                    >
                      Change Plan
                    </button>
                  </div>

                  {/* Form Grid - Responsive: 1 col mobile, 2 col tablet+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <input
                      value={proposal.customerDetails.fullName}
                      onChange={(e) => updateCustomer("fullName", e.target.value)}
                      placeholder="Full name"
                      className="w-full px-4 py-3.5 md:py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.08] transition-all text-sm md:text-base"
                    />
                    <input
                      value={proposal.customerDetails.email}
                      onChange={(e) => updateCustomer("email", e.target.value)}
                      placeholder="Email address"
                      type="email"
                      className="w-full px-4 py-3.5 md:py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.08] transition-all text-sm md:text-base"
                    />
                    <input
                      value={proposal.customerDetails.phone}
                      onChange={(e) => updateCustomer("phone", e.target.value)}
                      placeholder="Phone number"
                      type="tel"
                      className="w-full px-4 py-3.5 md:py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.08] transition-all text-sm md:text-base"
                    />
                    <input
                      value={proposal.customerDetails.occasion}
                      onChange={(e) => updateCustomer("occasion", e.target.value)}
                      placeholder="Occasion"
                      className="w-full px-4 py-3.5 md:py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.08] transition-all text-sm md:text-base"
                    />
                  </div>

                  {/* Password Field - Responsive */}
                  <div className="relative mb-6">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={proposal.customerDetails.password}
                      onChange={(e) => updateCustomer("password", e.target.value)}
                      placeholder="Set password"
                      className="w-full px-4 py-3.5 md:py-4 pr-24 rounded-2xl border border-white/10 bg-white/[0.05] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.08] transition-all text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-sans uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {pageError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-white text-sm font-sans leading-relaxed"
                      >
                        {pageError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button - Full width on mobile */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMailPopup("");
                      setMailSuccess(false);
                      setShowPublishPopup(true);
                    }}
                    disabled={!canSubmit}
                    className={`w-full py-4 md:py-5 rounded-full font-sans font-bold text-sm md:text-base uppercase tracking-widest transition-all ${
                      submitting || !canSubmit
                        ? "bg-[#d4af37]/20 text-white/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#d4af37] to-[#9a7420] text-[#140f05] hover:shadow-lg hover:shadow-[#d4af37]/25"
                    }`}
                  >
                    {submitting ? "Saving..." : "Continue to Final Proposal"}
                  </motion.button>

                  {/* Success/Error Message */}
                  <AnimatePresence>
                    {mailPopup && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mt-4 p-4 rounded-xl text-sm font-sans leading-relaxed ${
                          mailSuccess 
                            ? "border border-[#d4af37]/30 bg-[#d4af37]/10 text-white" 
                            : "border border-red-500/30 bg-red-500/10 text-white"
                        }`}
                      >
                        {mailPopup}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Right Column - Sidebar (Sticky on Desktop, Stack on Mobile) */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-6 space-y-4 md:space-y-6"
          >
            {/* Template Preview Card */}
            <div 
              className="rounded-[2rem] overflow-hidden min-h-[200px] md:min-h-[240px] p-5 md:p-6 flex flex-col justify-between relative"
              style={{ background: templateVisual(selectedTemplate) }}
            >
              <div className="flex justify-between gap-2">
                <span className="px-3 py-1.5 rounded-full bg-black/30 text-white text-xs font-sans backdrop-blur-sm">
                  {selectedTemplate?.relationshipType ?? "Template"}
                </span>
                {selectedPlan?.allTemplateAccess && (
                  <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-sans font-bold tracking-wider uppercase backdrop-blur-sm">
                    All Access
                  </span>
                )}
              </div>
              <div>
                <p className="font-sans text-xs tracking-widest uppercase text-white/70 mb-2">Selected Template</p>
                <h2 className="font-serif text-2xl md:text-3xl font-light leading-tight">{selectedTemplate?.name}</h2>
                <p className="font-serif italic text-white/70 mt-2 text-sm md:text-base">{selectedTemplate?.tagline}</p>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-5 md:p-6 rounded-[2rem] border border-[#d4af37]/20 bg-[#d4af37]/[0.05] backdrop-blur-sm">
              <p className="font-sans text-xs tracking-widest uppercase text-[#d4af37] mb-4 font-bold">Pricing Summary</p>
              
              <div className="space-y-3 text-sm md:text-base">
                <div className="flex justify-between text-white/70">
                  <span className="font-sans">Duration</span>
                  <span className="font-sans font-medium">{selectedPlan?.label ?? "Not selected"}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span className="font-sans">Access</span>
                  <span className="font-sans font-medium text-right">
                    {selectedPlan?.allTemplateAccess ? "All templates" : "Selected only"}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex justify-between font-sans font-bold text-lg md:text-xl text-white">
                  <span>Total</span>
                  <span className="text-[#d4af37]">{formatPrice(selectedPlan?.price ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Templates List - Scrollable on mobile if needed */}
            <div className="p-5 md:p-6 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <p className="font-sans text-xs tracking-widest uppercase text-white/50 mb-4 font-bold">Templates Included</p>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {accessibleTemplates.map((template) => (
                  <div key={template.id} className="flex justify-between gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-serif text-base md:text-lg truncate">{template.name}</p>
                      <p className="font-sans text-xs text-white/40 truncate">{template.tagline}</p>
                    </div>
                    <span className="font-sans text-xs text-[#d4af37] uppercase shrink-0">{template.family}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Publish Confirmation Modal - Responsive */}
      <AnimatePresence>
        {showPublishPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setShowPublishPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-[#d4af37]/30 bg-gradient-to-b from-[#181208]/98 to-[#080808]/98 p-6 md:p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <span className="text-xs font-sans tracking-widest uppercase text-[#d4af37] font-bold block mb-2">
                    Publish Confirmation
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light">
                    Mail me link jayega, <br />
                    <em className="text-[#d4af37] not-italic">ab public karna?</em>
                  </h2>
                </div>
                <button
                  onClick={() => setShowPublishPopup(false)}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="p-4 md:p-5 rounded-2xl border border-white/10 bg-white/[0.03] mb-4">
                <span className="text-xs font-sans tracking-widest uppercase text-white/50 block mb-3">Mail Preview</span>
                <p className="font-serif text-lg md:text-xl text-white mb-3">
                  Hi {proposal.customerDetails.fullName || "there"}, your proposal setup is complete.
                </p>
                <p className="font-sans text-sm text-white/70 leading-relaxed">
                  Template: <span className="text-white">{selectedTemplate?.name}</span><br />
                  Plan: <span className="text-white">{selectedPlan?.label}</span><br />
                  To: <span className="text-white">{proposal.customerDetails.email}</span>
                </p>
              </div>

              <div className="p-4 md:p-5 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.08] mb-6">
                <p className="font-serif text-base md:text-lg text-white mb-2">
                  `Yes, Publish` karoge to:
                </p>
                <p className="font-sans text-sm text-white/80 leading-relaxed">
                  Proposal public hoga aur mail send hoga {proposal.customerDetails.email} pe.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowPublishPopup(false)}
                  className="px-6 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-all font-sans text-sm uppercase tracking-wider font-medium"
                >
                  No, Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPublishPopup(false);
                    void submitFlow();
                  }}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-full font-sans text-sm uppercase tracking-wider font-bold transition-all ${
                    submitting
                      ? "bg-[#d4af37]/20 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#d4af37] to-[#9a7420] text-[#140f05] hover:shadow-lg"
                  }`}
                >
                  {submitting ? "Publishing..." : "Yes, Publish"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay - Responsive */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="min-w-[280px] md:min-w-[320px] rounded-3xl border border-[#d4af37]/20 bg-[#0c0a06]/95 p-6 md:p-8 text-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37] animate-spin mx-auto mb-4" />
              <p className="font-sans text-xs tracking-widest uppercase text-[#d4af37] font-bold mb-2">Publishing</p>
              <p className="font-serif text-base md:text-lg text-white/90">
                Check your mail for links...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212,175,55,0.5);
        }
      `}</style>
    </main>
  );
}

export default PublishPlanFlow;