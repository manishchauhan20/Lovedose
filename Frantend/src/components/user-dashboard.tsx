"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { type PublishPlan } from "@/lib/publish-plans";
import {
  loadPublishedProposal,
  publishProposal,
  type ProposalData,
} from "@/lib/proposal-storage";
import { TemplateCatalog } from "@/components/template-catalog";

const DASHBOARD_SESSION_KEY = "love-dose-dashboard-auth";

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

function formatExpiry(value: string) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const IconUser = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const IconClock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
const IconKey = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="15" r="4" /><path d="M12 11l8-8M17 6l2 2" /></svg>;
const IconGrid = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IconEye = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
const IconCheck = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
const IconStar = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;

export function UserDashboard() {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [publishingId, setPublishingId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mailStatus, setMailStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"templates" | "account">("templates");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [plans, setPlans] = useState<PublishPlan[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadPublishedProposal(),
      fetch("/api/templates", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/publish-plans", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([data, templateResponse, planResponse]) => {
      if (cancelled) {
        return;
      }

      if (data) {
        setProposal(data);
        setEmail(data.customerDetails.email);
      }

      setTemplates(templateResponse.templates ?? []);
      setPlans(planResponse.plans ?? []);

      if (typeof window !== "undefined" && sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "1") {
        setAuthenticated(true);
      }

      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const canLogin = Boolean(proposal.customerDetails.email && proposal.customerDetails.password);

  const handleLogin = () => {
    void (async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Invalid email or password.");
        return;
      }

      sessionStorage.setItem(DASHBOARD_SESSION_KEY, "1");
      setAuthenticated(true);
      setError("");
    })();
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && !window.confirm("Dashboard se logout karna hai?")) {
      return;
    }

    sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
    setAuthenticated(false);
    setPassword("");
    setActionStatus("Logged out successfully.");
  };

  const handleForgotPassword = async () => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: proposal.customerDetails.email,
        fullName: proposal.customerDetails.fullName,
        password: proposal.customerDetails.password,
      }),
    });
    const result = await response.json();
    setMailStatus(result.message || result.error || "Unable to send password mail.");
  };

  const handlePublish = async (templateId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Is template ko abhi live publish karna hai?")) {
      return;
    }

    setPublishingId(templateId);
    const next = { ...proposal, templateId };

    try {
      await publishProposal(next);
      setProposal(next);
      setActionStatus("Template published successfully.");
      router.push("/proposal");
    } finally {
      setPublishingId("");
    }
  };

  const handleViewTemplate = (templateId: string) => {
    router.push(`/proposal?preview=1&templateId=${encodeURIComponent(templateId)}`);
  };

  const selectedPlan = plans.find((plan) => plan.id === proposal.publishDurationId) ?? null;
  const isPlanExpired = Boolean(
    proposal.publishExpiresAt && new Date(proposal.publishExpiresAt).getTime() <= currentTime,
  );
  const hasMonthOrLongerAccess = Boolean((selectedPlan?.hours ?? proposal.publishHours) >= 24 * 30 && !isPlanExpired);
  const shortPlanTemplateIds = proposal.purchasedTemplateIds.length > 0
    ? proposal.purchasedTemplateIds
    : proposal.templateId
      ? [proposal.templateId]
      : [];
  const includedTemplateIds = hasMonthOrLongerAccess
    ? templates.map((template) => template.id)
    : !isPlanExpired
      ? shortPlanTemplateIds
      : [];
  const activeCount = includedTemplateIds.length;

  const handleOpenPayment = () => {
    router.push("/publish-plan");
  };

  if (!loaded) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#06050400]" style={{ background: "#070604" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#c9a84c]/30 border-t-[#c9a84c] animate-spin" />
          <p className="text-[#c9a84c]/60 text-xs tracking-[0.3em] uppercase font-light" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Loading
          </p>
        </div>
      </main>
    );
  }

  if (!canLogin) {
    return (
      <main className="min-h-screen grid place-items-center px-4" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mx-auto mb-5">
            <IconKey />
          </div>
          <h1 className="text-2xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
            Setup Required
          </h1>
          <p className="text-sm text-white/35 leading-relaxed mb-6">
            Publish plan complete karo aur email/password set karo.
          </p>
          <Link href="/publish-plan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.12em] uppercase transition-all" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}>
            Open Publish Plan →
          </Link>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="hidden lg:flex w-[46%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0f0b04 0%, #1a1206 40%, #0a0804 100%)" }}>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(201,168,76,0.1) 0%, transparent 60%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <div className="relative z-10">
            <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.5em] uppercase mb-1">LoveDose</p>
            <div className="w-5 h-px bg-[#c9a84c]/40" />
          </div>

          <div className="relative z-10">
            <p className="text-white/20 text-[0.65rem] tracking-[0.2em] uppercase mb-4">Premium Proposals</p>
            <h2 className="text-5xl font-light leading-[1.08] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
              Your love story,
              <br />
              <em className="text-[#c9a84c]">beautifully told</em>
            </h2>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Access your premium templates and manage your proposal from one place.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#e07830", "#c9a84c", "#8b5cf6"].map((color, index) => (
                <div key={index} className="w-7 h-7 rounded-full border-2 border-[#0f0b04] flex items-center justify-center text-[8px]" style={{ background: color }}>♥</div>
              ))}
            </div>
            <p className="text-white/30 text-xs">Trusted by couples worldwide</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8 text-center">
              <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.5em] uppercase">LoveDose</p>
            </div>

            <p className="text-[#c9a84c] text-[0.62rem] tracking-[0.28em] uppercase mb-2">Dashboard Login</p>
            <h1 className="text-3xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>Welcome back</h1>
            <p className="text-white/35 text-sm mb-8 leading-relaxed">
              Apna publish-plan email aur password enter karo.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[0.6rem] tracking-[0.18em] uppercase text-white/30 mb-1.5">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm font-light outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0e8d8" }}
                />
              </div>

              <div>
                <label className="block text-[0.6rem] tracking-[0.18em] uppercase text-white/30 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-16 rounded-xl text-sm font-light outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0e8d8" }}
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30 hover:text-[#c9a84c] text-[0.58rem] tracking-[0.1em] uppercase transition-colors">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <p className="text-[#ff9e7a] text-xs pl-0.5 -mt-1">{error}</p>}
              {mailStatus && <p className="text-[#c9a84c] text-xs pl-0.5 -mt-1">{mailStatus}</p>}
              {actionStatus && <p className="text-[#c9a84c] text-xs pl-0.5 -mt-1">{actionStatus}</p>}

              <button type="button" onClick={handleLogin} className="w-full py-3.5 rounded-xl text-xs tracking-[0.18em] uppercase font-medium transition-opacity hover:opacity-85 mt-1" style={{ background: "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)", color: "#060400" }}>
                Sign In
              </button>

              <button type="button" onClick={() => void handleForgotPassword()} className="text-white/25 hover:text-[#c9a84c] text-xs text-center transition-colors pt-0.5">
                Forgot password? Send to email →
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif", color: "#f0e8d8" }}>
      <aside
        className={`fixed lg:sticky top-0 h-screen z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 220, background: "#0a0805", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}
      >
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[#c9a84c] text-[0.62rem] tracking-[0.4em] uppercase mb-0.5">LoveDose</p>
          <p className="text-white/20 text-[0.55rem] tracking-[0.18em] uppercase">Dashboard</p>
        </div>

        <nav className="flex-1 px-3 pt-4 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab("templates"); setSidebarOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs tracking-[0.1em] uppercase transition-all w-full text-left"
            style={activeTab === "templates"
              ? { background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }
              : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
          >
            <IconGrid />
            Templates
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("account"); setSidebarOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs tracking-[0.1em] uppercase transition-all w-full text-left"
            style={activeTab === "account"
              ? { background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }
              : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
          >
            <IconUser />
            Account
          </button>
          <Link
            href="/templates"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs tracking-[0.1em] uppercase transition-all"
            style={{ color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
          >
            <IconStar />
            Browse
          </Link>
        </nav>

        <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}>
          <p className="text-[#c9a84c] text-[0.55rem] tracking-[0.2em] uppercase mb-1">Current Plan</p>
          <p className="text-[#f0e8d8] text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {proposal.publishDurationLabel || "No plan"}
          </p>
          <p className="text-white/25 text-[0.6rem] mt-0.5">{formatExpiry(proposal.publishExpiresAt)}</p>
          <p className="text-[0.58rem] mt-2" style={{ color: isPlanExpired ? "#ff9e7a" : "#c9a84c" }}>
            {isPlanExpired
              ? "Plan expired. Renew payment to unlock templates."
              : hasMonthOrLongerAccess
                ? "All templates unlocked."
                : "Only purchased template is unlocked."}
          </p>
        </div>

        <div className="px-3 pb-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
              {proposal.customerDetails.fullName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-[#f0e8d8] text-xs truncate">{proposal.customerDetails.fullName || "User"}</p>
              <p className="text-white/25 text-[0.6rem] truncate">{proposal.customerDetails.email}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs tracking-[0.1em] uppercase w-full transition-all hover:text-white/60" style={{ color: "rgba(255,255,255,0.25)", border: "1px solid transparent" }}>
            <IconLogout />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 flex items-center justify-between px-5 shrink-0 sticky top-0 z-10" style={{ background: "rgba(7,6,4,0.85)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white/70" style={{ border: "1px solid rgba(255,255,255,0.08)" }} onClick={() => setSidebarOpen((value) => !value)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/25">
              {activeTab === "templates" ? "Templates" : "Account"}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#c9a84c" }}>
              <IconStar />
              {activeCount} Included
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-white/30" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <IconGrid />
              {templates.length} Total
            </div>
          </div>
        </header>

        {activeTab === "templates" && (
          <main className="flex-1 px-5 pt-8 pb-16 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {proposal.templateId && (
                <div className="mb-6 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4 flex-wrap" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                      <IconCheck />
                    </div>
                    <div>
                      <p className="text-[#c9a84c] text-xs tracking-[0.1em] uppercase">Active Template</p>
                      <p className="text-[#f0e8d8] text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {templates.find((template) => template.id === proposal.templateId)?.name || proposal.templateId}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => router.push("/proposal")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs tracking-[0.1em] uppercase transition-all hover:opacity-80" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)" }}>
                    <IconEye /> View Live
                  </button>
                </div>
              )}

              {(isPlanExpired || !hasMonthOrLongerAccess) && (
                <div className="mb-6 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4 flex-wrap" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="text-[#c9a84c] text-xs tracking-[0.1em] uppercase">
                      {isPlanExpired ? "Access Locked" : "Limited Access"}
                    </p>
                    <p className="text-white/45 text-sm mt-1">
                      {isPlanExpired
                        ? "Time over hone ke baad sab templates paid ho gaye hain."
                        : "1 month se kam plan me sirf purchased template unlocked rahega."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPayment}
                    className="px-4 py-2 rounded-xl text-xs tracking-[0.1em] uppercase transition-all hover:opacity-80"
                    style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)" }}
                  >
                    {isPlanExpired ? "Renew Payment" : "Upgrade Plan"}
                  </button>
                </div>
              )}

              <TemplateCatalog
                templates={templates}
                selectedTemplateId={proposal.templateId}
                busyTemplateId={publishingId}
                onView={handleViewTemplate}
                onPrimaryAction={(templateId) => {
                  if (includedTemplateIds.includes(templateId)) {
                    void handlePublish(templateId);
                    return;
                  }

                  handleOpenPayment();
                }}
                getPrimaryLabel={(template) => {
                  const isIncluded = includedTemplateIds.includes(template.id);
                  const isActive = proposal.templateId === template.id;

                  if (publishingId === template.id) {
                    return "Publishing...";
                  }

                  if (isIncluded) {
                    return isActive ? "Re-publish" : "Publish";
                  }

                  return isPlanExpired ? "Renew" : "Payment";
                }}
                getTemplateStatus={(template) => (
                  includedTemplateIds.includes(template.id)
                    ? { label: "Included", tone: "accent" }
                    : { label: "Paid", tone: "muted" }
                )}
              />
            </div>
          </main>
        )}

        {activeTab === "account" && (
          <main className="flex-1 px-5 pt-8 pb-16 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <p className="text-[#c9a84c] text-[0.6rem] tracking-[0.28em] uppercase mb-2">Account</p>
                <h1 className="text-4xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Your details
                </h1>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-light shrink-0" style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", fontFamily: "'Cormorant Garamond', serif" }}>
                      {proposal.customerDetails.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-[#f0e8d8] text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {proposal.customerDetails.fullName || "—"}
                      </p>
                      <p className="text-white/35 text-xs mt-0.5">{proposal.customerDetails.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {proposal.customerDetails.phone && (
                      <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-1">Phone</p>
                        <p className="text-[#f0e8d8] text-sm">{proposal.customerDetails.phone}</p>
                      </div>
                    )}
                    {proposal.customerDetails.occasion && (
                      <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-1">Occasion</p>
                        <p className="text-[#f0e8d8] text-sm">{proposal.customerDetails.occasion}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(201,168,76,0.14)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <IconClock />
                    <p className="text-[#c9a84c] text-[0.6rem] tracking-[0.22em] uppercase">Subscription Plan</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-1">Plan</p>
                      <p className="text-[#f0e8d8] text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {proposal.publishDurationLabel || "No plan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-1">Expires</p>
                      <p className="text-[#f0e8d8] text-sm">{formatExpiry(proposal.publishExpiresAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <IconKey />
                    <p className="text-[#c9a84c] text-[0.6rem] tracking-[0.22em] uppercase">Template Access</p>
                  </div>
                  <p className="text-[#f0e8d8] text-xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {hasMonthOrLongerAccess ? "All Premium Templates" : isPlanExpired ? "No Active Template Access" : "Selected Templates"}
                  </p>
                  <p className="text-white/30 text-xs mb-4">
                    {activeCount} of {templates.length} templates included
                  </p>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${templates.length ? (activeCount / templates.length) * 100 : 0}%`, background: "linear-gradient(90deg, #c9a84c, #8a6e28)" }} />
                  </div>
                </div>

                {proposal.customerDetails.notes && (
                  <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-2">Notes</p>
                    <p className="text-white/50 text-sm leading-relaxed">{proposal.customerDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
