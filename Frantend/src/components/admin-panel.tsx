"use client";

import { useEffect, useMemo, useState } from "react";
import { type PublishPlan } from "@/lib/publish-plans";
import { createEmptyManagedProposal, type ManagedProposal } from "@/lib/managed-proposals";
import { normalizeProposal, type ProposalData } from "@/lib/proposal-storage";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { type CustomerRecord } from "@/lib/server/customer-store";

type AdminTab = "overview" | "customers" | "templates" | "plans" | "proposals";
type OverviewMetrics = {
  templates: number; plans: number; proposals: number; customers: number;
  draftUsers: number; publishedUsers: number;
  activeCustomers: number; expiredCustomers: number;
  totalLogins: number; formFilledUsers: number; totalRecords: number; hasDraftProposal: boolean; hasPublishedProposal: boolean;
};

const emptyProposal: ProposalData = normalizeProposal({}) as ProposalData;
const emptyTemplate: ProposalTemplate = { id: "", proposalId: 0, relationshipType: "GF", name: "", tagline: "", description: "", family: "romantic", image: "" };
const emptyPlan: PublishPlan = { id: "1h", label: "", description: "", hours: 1, price: 0, allTemplateAccess: false };
const emptyManagedProposal = createEmptyManagedProposal();
const emptyMetrics: OverviewMetrics = { templates: 0, plans: 0, proposals: 0, customers: 0, draftUsers: 0, publishedUsers: 0, activeCustomers: 0, expiredCustomers: 0, totalLogins: 0, formFilledUsers: 0, totalRecords: 0, hasDraftProposal: false, hasPublishedProposal: false };

function formatDateTime(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function getPlanState(expiresAt: string): "Active" | "Expired" | "Draft" {
  if (!expiresAt) return "Draft";
  return new Date(expiresAt).getTime() > Date.now() ? "Active" : "Expired";
}

function templateGradient(family: ProposalTemplate["family"]) {
  if (family === "royal")  return "from-[#1a1208] via-[#9a7228] to-[#0e0c06]";
  if (family === "dreamy") return "from-[#130d18] via-[#6d47c0] to-[#09070d]";
  return "from-[#1f0e08] via-[#c06030] to-[#0f0604]";
}

// ─── Tiny SVG icons ────────────────────────────────────────────
const Ico = {
  grid:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  users:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  layers:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  tag:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  file:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  logout:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  refresh:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  plus:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  check:     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  search:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chevron:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
};

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",   label: "Overview",   icon: Ico.grid   },
  { id: "customers",  label: "Customers",  icon: Ico.users  },
  { id: "templates",  label: "Templates",  icon: Ico.layers },
  { id: "plans",      label: "Plans",      icon: Ico.tag    },
  { id: "proposals",  label: "Proposals",  icon: Ico.file   },
];

export function AdminPanel() {
  const [authenticated, setAuthenticated]     = useState(false);
  const [checkedSession, setCheckedSession]   = useState(false);
  const [username, setUsername]               = useState("");
  const [password, setPassword]               = useState("");
  const [loginError, setLoginError]           = useState("");
  const [tab, setTab]                         = useState<AdminTab>("overview");
  const [loading, setLoading]                 = useState(true);
  const [metrics, setMetrics]                 = useState<OverviewMetrics>(emptyMetrics);
  const [templates, setTemplates]             = useState<ProposalTemplate[]>([]);
  const [plans, setPlans]                     = useState<PublishPlan[]>([]);
  const [managedProposals, setManagedProposals] = useState<ManagedProposal[]>([]);
  const [customers, setCustomers]             = useState<CustomerRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedPlanId, setSelectedPlanId]   = useState("");
  const [selectedManagedProposalId, setSelectedManagedProposalId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [templateForm, setTemplateForm]       = useState<ProposalTemplate>(emptyTemplate);
  const [planForm, setPlanForm]               = useState<PublishPlan>(emptyPlan);
  const [managedProposalForm, setManagedProposalForm] = useState<ManagedProposal>(emptyManagedProposal);
  const [managedProposalJson, setManagedProposalJson] = useState(JSON.stringify(emptyManagedProposal.proposal, null, 2));
  const [customerSearch, setCustomerSearch]   = useState("");
  const [status, setStatus]                   = useState("");
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [actionLoading, setActionLoading]     = useState("");

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => [c.fullName, c.email, c.planLabel, c.templateName].join(" ").toLowerCase().includes(q));
  }, [customerSearch, customers]);

  const selectedCustomer = useMemo(
    () => filteredCustomers.find((c) => c.id === selectedCustomerId) ?? customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, filteredCustomers, selectedCustomerId],
  );

  async function loadAdminData() {
    setLoading(true);
    const [oR, tR, pR, mpR] = await Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/templates", { cache: "no-store" }),
      fetch("/api/admin/plans", { cache: "no-store" }),
      fetch("/api/admin/proposals", { cache: "no-store" }),
    ]);
    if ([oR, tR, pR, mpR].some((r) => r.status === 401)) { setAuthenticated(false); setLoading(false); return; }
    const [overview, tData, pData, mpData] = await Promise.all([oR.json(), tR.json(), pR.json(), mpR.json()]);
    const nextCust = overview.customers ?? [];
    const nextManaged = mpData.proposals ?? [];
    setMetrics(overview.metrics ?? emptyMetrics);
    setTemplates(tData.templates ?? []);
    setPlans(pData.plans ?? []);
    setManagedProposals(nextManaged);
    setCustomers(nextCust);
    setSelectedCustomerId((c) => c || nextCust[0]?.id || "");
    setSelectedManagedProposalId((c) => c || nextManaged[0]?.id || "");
    setLoading(false);
  }

  async function runAdminAction(action: string, task: () => Promise<void>) {
    setActionLoading(action);
    try {
      await task();
    } finally {
      setActionLoading("");
    }
  }

  function confirmAction(message: string) {
    if (typeof window === "undefined") {
      return true;
    }

    return window.confirm(message);
  }

  function handleTemplateSelect(id: string) {
    setSelectedTemplateId(id);
    setTemplateForm(templates.find((t) => t.id === id) ?? emptyTemplate);
  }
  function handlePlanSelect(id: string) {
    setSelectedPlanId(id);
    setPlanForm(plans.find((p) => p.id === id) ?? emptyPlan);
  }
  function handleManagedProposalSelect(id: string) {
    setSelectedManagedProposalId(id);
    const proposal = managedProposals.find((item) => item.id === id) ?? emptyManagedProposal;
    setManagedProposalForm(proposal);
    setManagedProposalJson(JSON.stringify(proposal.proposal ?? emptyProposal, null, 2));
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      const nextAuthenticated = Boolean(data.authenticated);

      if (!active) {
        return;
      }

      setAuthenticated(nextAuthenticated);

      if (nextAuthenticated) {
        await loadAdminData();
      }

      if (active) {
        setCheckedSession(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async () => {
    setLoginError("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const d = await r.json();
    if (!r.ok) { setLoginError(d.error || "Login failed."); return; }
    await loadAdminData();
    setAuthenticated(true);
  };
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); setCheckedSession(true); };

  const saveTemplate = async () => {
    await runAdminAction("save-template", async () => {
      const method = selectedTemplateId ? "PUT" : "POST";
      const url = selectedTemplateId ? `/api/admin/templates/${encodeURIComponent(selectedTemplateId)}` : "/api/admin/templates";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template: templateForm }) });
      const d = await r.json();
      if (!r.ok) return void setStatus(d.error || "Save failed.");
      setStatus("Template saved."); setSelectedTemplateId(d.template.id); setTemplateForm(d.template); await loadAdminData();
    });
  };
  const removeTemplate = async () => {
    if (!selectedTemplateId) return;
    if (!confirmAction("Selected template delete karna hai?")) return;
    await runAdminAction("remove-template", async () => {
      const r = await fetch(`/api/admin/templates/${encodeURIComponent(selectedTemplateId)}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) return void setStatus(d.error || "Delete failed.");
      setSelectedTemplateId(""); setTemplateForm(emptyTemplate); setStatus("Template deleted."); await loadAdminData();
    });
  };
  const savePlan = async () => {
    await runAdminAction("save-plan", async () => {
      const method = selectedPlanId ? "PUT" : "POST";
      const url = selectedPlanId ? `/api/admin/plans/${encodeURIComponent(selectedPlanId)}` : "/api/admin/plans";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planForm }) });
      const d = await r.json();
      if (!r.ok) return void setStatus(d.error || "Save failed.");
      setStatus("Plan saved."); setSelectedPlanId(d.plan.id); setPlanForm(d.plan); await loadAdminData();
    });
  };
  const removePlan = async () => {
    if (!selectedPlanId) return;
    if (!confirmAction("Selected plan delete karna hai?")) return;
    await runAdminAction("remove-plan", async () => {
      const r = await fetch(`/api/admin/plans/${encodeURIComponent(selectedPlanId)}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) return void setStatus(d.error || "Delete failed.");
      setSelectedPlanId(""); setPlanForm(emptyPlan); setStatus("Plan deleted."); await loadAdminData();
    });
  };
  const removeCustomer = async () => {
    if (!selectedCustomerId) return;
    if (!confirmAction("Selected customer permanently delete karna hai?")) return;
    await runAdminAction("remove-customer", async () => {
      const r = await fetch(`/api/admin/customers/${encodeURIComponent(selectedCustomerId)}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) return void setStatus(d.error || "Delete failed.");
      setStatus("Customer deleted."); setSelectedCustomerId(""); await loadAdminData();
    });
  };
  const saveManagedProposal = async () => {
    await runAdminAction("save-proposal", async () => {
      try {
        const parsed = normalizeProposal(JSON.parse(managedProposalJson) as ProposalData);
        if (!parsed) return void setStatus("Invalid proposal JSON.");
        const now = new Date().toISOString();
        const payload: ManagedProposal = {
          ...managedProposalForm,
          id: managedProposalForm.id || managedProposalForm.slug || crypto.randomUUID(),
          slug: managedProposalForm.slug.trim(),
          title: managedProposalForm.title.trim(),
          templateId: managedProposalForm.templateId.trim(),
          coverImage: managedProposalForm.coverImage.trim() || parsed.heroImage,
          themeFamily: managedProposalForm.themeFamily,
          proposal: parsed,
          createdAt: managedProposalForm.createdAt || now,
          updatedAt: now,
        };
        if (!payload.slug || !payload.title) return void setStatus("Slug and title are required.");
        const method = selectedManagedProposalId ? "PUT" : "POST";
        const url = selectedManagedProposalId ? `/api/admin/proposals/${encodeURIComponent(selectedManagedProposalId)}` : "/api/admin/proposals";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposal: payload }),
        });
        const data = await response.json();
        if (!response.ok) return void setStatus(data.error || "Proposal save failed.");
        setManagedProposalForm(data.proposal);
        setManagedProposalJson(JSON.stringify(data.proposal.proposal, null, 2));
        setSelectedManagedProposalId(data.proposal.id);
        setStatus("Managed proposal saved.");
        await loadAdminData();
      } catch {
        setStatus("Invalid proposal JSON.");
      }
    });
  };
  const removeManagedProposal = async () => {
    if (!selectedManagedProposalId) return;
    if (!confirmAction("Selected proposal delete karna hai?")) return;
    await runAdminAction("remove-proposal", async () => {
      const response = await fetch(`/api/admin/proposals/${encodeURIComponent(selectedManagedProposalId)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) return void setStatus(data.error || "Delete failed.");
      setSelectedManagedProposalId("");
      setManagedProposalForm(emptyManagedProposal);
      setManagedProposalJson(JSON.stringify(emptyManagedProposal.proposal, null, 2));
      setStatus("Managed proposal deleted.");
      await loadAdminData();
    });
  };
  /* ── Checking session ── */
  if (!checkedSession) return (
    <div className="min-h-screen grid place-items-center" style={{ background: "#06050380" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-amber-500/20 border-t-amber-500/70 animate-spin" />
        <p className="text-amber-500/40 text-[0.6rem] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>Checking session</p>
      </div>
    </div>
  );

  /* ── Login ── */
  if (!authenticated) return (
    <div className="min-h-screen flex items-stretch" style={{ background: "#060504", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left — decorative */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-14 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0e0a04 0%, #1a1208 50%, #080604 100%)" }}>
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute" style={{ top: "15%", left: "20%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative z-10">
          <p className="text-amber-500/80 text-[0.62rem] tracking-[0.5em] uppercase mb-1">LoveDose</p>
          <div className="w-5 h-px bg-amber-500/30" />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-white/20 text-[0.6rem] tracking-[0.24em] uppercase mb-5">Admin Control Panel</p>
          <h1 className="text-6xl font-light leading-[1.04] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
            The command
            <br /><em style={{ color: "#c9a84c" }}>centre</em>
          </h1>
          <p className="text-white/30 text-sm leading-relaxed mb-8">
            Full control over templates, pricing, customer records, and live proposal state.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Customers", "Templates", "Plans", "Analytics", "Proposal State"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-lg text-[0.6rem] tracking-[0.12em] uppercase text-amber-500/60" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.14)" }}>{t}</span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/15 text-[0.6rem] tracking-[0.18em] uppercase">Restricted access · Admins only</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <p className="text-amber-500/70 text-[0.62rem] tracking-[0.4em] uppercase">LoveDose Admin</p>
          </div>

          <p className="text-amber-500/70 text-[0.6rem] tracking-[0.26em] uppercase mb-2">Secure Login</p>
          <h2 className="text-3xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>Administrator</h2>
          <p className="text-white/25 text-sm mb-8">Enter your admin credentials to continue.</p>

          <div className="flex flex-col gap-3">
            <AdminInput label="Username" value={username} onChange={setUsername} placeholder="admin" />
            <AdminInput label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" onEnter={() => void handleLogin()} />
            {loginError && <p className="text-red-400/80 text-xs">{loginError}</p>}
            <button type="button" onClick={() => void handleLogin()} className="w-full py-3.5 rounded-xl text-xs tracking-[0.18em] uppercase font-medium transition-opacity hover:opacity-85 mt-1" style={{ background: "linear-gradient(135deg,#c9a84c,#8a6e28)", color: "#060400" }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen grid place-items-center" style={{ background: "#060504" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-amber-500/20 border-t-amber-500/70 animate-spin" />
        <p className="text-amber-500/40 text-[0.6rem] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading panel</p>
      </div>
    </div>
  );

  /* ── Main Dashboard ── */
  return (
    <div className="flex min-h-screen" style={{ background: "#060504", fontFamily: "'DM Sans', sans-serif", color: "#f0e8d8" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} shrink-0`}
        style={{ width: 210, background: "#08070500", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-amber-500/80 text-[0.6rem] tracking-[0.45em] uppercase mb-0.5">LoveDose</p>
          <p className="text-white/18 text-[0.52rem] tracking-[0.16em] uppercase">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[0.7rem] tracking-[0.08em] uppercase w-full text-left transition-all"
              style={tab === id
                ? { background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }
                : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }
              }
            >
              {icon}{label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[0.7rem] tracking-[0.08em] uppercase w-full transition-all text-white/25 hover:text-white/50"
          >
            {Ico.logout} Logout
          </button>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-20 lg:hidden bg-black/60" onClick={() => setSidebarOpen(false)} />}

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-5 shrink-0 sticky top-0 z-10" style={{ background: "rgba(6,5,4,0.85)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden p-1.5 rounded-lg text-white/30 hover:text-white/60" style={{ border: "1px solid rgba(255,255,255,0.08)" }} onClick={() => setSidebarOpen(v => !v)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <p className="text-white/30 text-[0.6rem] tracking-[0.2em] uppercase capitalize">{tab}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actionLoading && (
              <span className="text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg text-white/70" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Processing...
              </span>
            )}
            {status && (
              <span className="text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg text-amber-500/80" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.18)" }}>
                {status}
              </span>
            )}
            <button type="button" disabled={loading || Boolean(actionLoading)} onClick={() => void loadAdminData()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase transition-all text-white/30 hover:text-white/60 disabled:opacity-50 disabled:cursor-not-allowed" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {Ico.refresh} Refresh
            </button>
          </div>
        </header>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <main className="flex-1 px-5 pt-7 pb-14 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <SectionHeading eyebrow="Dashboard" title="Overview" />

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  { label: "Customers",    value: metrics.customers,        hint: "Total users"        },
                  { label: "Proposals",    value: metrics.proposals,        hint: "Frontend entries"   },
                  { label: "Records",      value: metrics.totalRecords,     hint: "Tracked entries"    },
                  { label: "Filled",       value: metrics.formFilledUsers,  hint: "80%+ form done"     },
                  { label: "Logins",       value: metrics.totalLogins,      hint: "All-time sign-ins"  },
                  { label: "Active",       value: metrics.activeCustomers,  hint: "Live plans"         },
                  { label: "Expired",      value: metrics.expiredCustomers, hint: "Need renewal"       },
                  { label: "Templates",    value: metrics.templates,        hint: "In catalog"         },
                  { label: "Plans",        value: metrics.plans,            hint: "Pricing tiers"      },
                ].map(({ label, value, hint }) => (
                  <div key={label} className="p-4 rounded-2xl flex flex-col gap-1" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-amber-500/60 text-[0.55rem] tracking-[0.2em] uppercase">{label}</p>
                    <p className="text-3xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8", lineHeight: 1 }}>{value}</p>
                    <p className="text-white/20 text-[0.58rem]">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent customers */}
                <SidePanel title="Recent Customers" badge={`${customers.length}`}>
                  <div className="flex flex-col gap-2">
                    {customers.slice(0, 6).map((c) => (
                      <button key={c.id} type="button" onClick={() => { setSelectedCustomerId(c.id); setTab("customers"); }} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:border-white/12 w-full" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                        <div className="min-w-0">
                          <p className="text-[#f0e8d8] text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{c.fullName || c.email}</p>
                          <p className="text-white/25 text-[0.6rem] truncate">{c.email}</p>
                        </div>
                        <StateTag state={getPlanState(c.publishExpiresAt)} />
                      </button>
                    ))}
                  </div>
                </SidePanel>

                {/* Live proposal */}
                <SidePanel title="Live Proposal" badge={metrics.hasPublishedProposal ? "Live" : "Empty"} badgeActive={metrics.hasPublishedProposal}>
                  {metrics.hasPublishedProposal ? (
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Published", value: "Available" },
                        { label: "Managed", value: String(managedProposals.filter((proposal) => proposal.status === "published").length) },
                        { label: "Templates", value: String(templates.length) },
                        { label: "Plans", value: String(plans.length) },
                        { label: "Customers", value: String(customers.length) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="text-white/25 text-[0.6rem] tracking-[0.14em] uppercase">{label}</span>
                          <span className="text-[#f0e8d8] text-xs text-right truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : <EmptySlate title="No published proposal" text="Publish a plan to see live data here." />}
                </SidePanel>

                <SidePanel title="Managed Proposals" badge={`${managedProposals.length}`}>
                  <div className="flex flex-col gap-2">
                    {managedProposals.slice(0, 6).map((proposal) => (
                      <button key={proposal.id} type="button" onClick={() => { handleManagedProposalSelect(proposal.id); setTab("proposals"); }} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:border-white/12 w-full" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                        <div className="min-w-0">
                          <p className="text-[#f0e8d8] text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{proposal.title}</p>
                          <p className="text-white/25 text-[0.6rem] truncate">/{proposal.slug}</p>
                        </div>
                        <StateTag state={proposal.status === "published" ? "Active" : "Draft"} />
                      </button>
                    ))}
                  </div>
                </SidePanel>
              </div>
            </div>
          </main>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <main className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-80 shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-4 pt-5 pb-3">
                <SectionHeading eyebrow="Records" title="Customers" compact />
                <div className="relative mt-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{Ico.search}</span>
                  <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search…" className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs outline-none transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#f0e8d8" }} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-1.5">
                {filteredCustomers.map((c) => (
                  <button key={c.id} type="button" onClick={() => setSelectedCustomerId(c.id)} className="w-full text-left px-3 py-2.5 rounded-xl transition-all" style={selectedCustomerId === c.id
                    ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" }
                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }
                  }>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[#f0e8d8] text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{c.fullName || c.email}</p>
                      <StateTag state={getPlanState(c.publishExpiresAt)} tiny />
                    </div>
                    <p className="text-white/25 text-[0.6rem] truncate">{c.email}</p>
                    <p className="text-white/20 text-[0.58rem] truncate mt-0.5">{c.planLabel || "No plan"}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10 min-w-0">
              {selectedCustomer ? (
                <div className="max-w-2xl">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-base font-light shrink-0" style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", fontFamily: "'Cormorant Garamond', serif" }}>
                        {selectedCustomer.fullName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h2 className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>{selectedCustomer.fullName || "Unnamed"}</h2>
                        <p className="text-white/30 text-xs">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void removeCustomer()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.62rem] tracking-[0.1em] uppercase transition-all text-red-400/60 hover:text-red-400/90" style={{ border: "1px solid rgba(255,100,100,0.15)" }}>
                      {Ico.trash} Delete
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2.5 mb-5">
                    {[
                      { l: "Logins",   v: selectedCustomer.loginCount },
                      { l: "State",    v: getPlanState(selectedCustomer.publishExpiresAt) },
                      { l: "Hours",    v: selectedCustomer.planHours || 0 },
                      { l: "Price",    v: `₹${selectedCustomer.planPrice || 0}` },
                    ].map(({ l, v }) => (
                      <div key={l} className="p-3 rounded-xl text-center" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="text-amber-500/50 text-[0.52rem] tracking-[0.16em] uppercase mb-1">{l}</p>
                        <p className="text-[#f0e8d8] text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoBlock title="Contact">
                      <IRow l="Name"     v={selectedCustomer.fullName     || "—"} />
                      <IRow l="Phone"    v={selectedCustomer.phone        || "—"} />
                      <IRow l="Occasion" v={selectedCustomer.occasion     || "—"} />
                    </InfoBlock>
                    <InfoBlock title="Access">
                      <IRow l="Template" v={selectedCustomer.templateName || selectedCustomer.templateId || "—"} />
                      <IRow l="Plan"     v={selectedCustomer.planLabel    || "—"} />
                      <IRow l="All access" v={selectedCustomer.allTemplateAccess ? "Yes" : "No"} />
                    </InfoBlock>
                    <InfoBlock title="Activity">
                      <IRow l="Created"    v={formatDateTime(selectedCustomer.createdAt)}      />
                      <IRow l="First login" v={formatDateTime(selectedCustomer.firstLoginAt)}  />
                      <IRow l="Last login"  v={formatDateTime(selectedCustomer.lastLoginAt)}   />
                      <IRow l="Expires"     v={formatDateTime(selectedCustomer.publishExpiresAt)} />
                    </InfoBlock>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="mt-3 p-4 rounded-xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-white/25 text-[0.55rem] tracking-[0.16em] uppercase mb-2">Notes</p>
                      <p className="text-white/40 text-xs leading-relaxed">{selectedCustomer.notes}</p>
                    </div>
                  )}
                </div>
              ) : <EmptySlate title="No customer selected" text="Click a customer on the left to inspect details." />}
            </div>
          </main>
        )}

        {/* ── TEMPLATES ── */}
        {tab === "templates" && (
          <main className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-72 shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-4 pt-5 pb-3 flex items-center justify-between">
                <SectionHeading eyebrow="Catalog" title="Templates" compact />
                <button type="button" onClick={() => { setSelectedTemplateId(""); setTemplateForm(emptyTemplate); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-amber-500/70 hover:text-amber-500 transition-colors" style={{ border: "1px solid rgba(201,168,76,0.18)" }}>
                  {Ico.plus} New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-1.5">
                {templates.map((t) => (
                  <button key={t.id} type="button" onClick={() => handleTemplateSelect(t.id)} className="w-full text-left px-3 py-3 rounded-xl transition-all" style={selectedTemplateId === t.id
                    ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" }
                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }
                  }>
                    <p className="text-[#f0e8d8] text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t.name || "Untitled"}</p>
                    <p className="text-white/25 text-[0.6rem] mt-0.5 truncate italic">{t.tagline || "No tagline"}</p>
                    <p className="text-white/18 text-[0.55rem] mt-1 uppercase tracking-[0.1em]">{t.relationshipType} · {t.family}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor + Preview */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 min-w-0">
              <div className="max-w-2xl flex flex-col gap-4">
                {/* Preview card */}
                <div
                  className={`h-36 rounded-2xl ${templateForm.image ? "" : `bg-gradient-to-br ${templateGradient(templateForm.family)}`} relative overflow-hidden flex flex-col justify-end p-4`}
                  style={templateForm.image
                    ? { background: `linear-gradient(rgba(10,8,4,0.22), rgba(10,8,4,0.78)), url(${templateForm.image}) center/cover` }
                    : undefined}
                >
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }} />
                  <p className="text-white/40 text-[0.58rem] tracking-[0.18em] uppercase relative z-10">{templateForm.relationshipType} · {templateForm.family}</p>
                  <h3 className="text-2xl font-light relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>{templateForm.name || "Template Name"}</h3>
                  <p className="text-white/40 text-xs italic relative z-10">{templateForm.tagline || "Tagline"}</p>
                </div>

                {/* Form */}
                <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#f0e8d8] text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{selectedTemplateId ? "Edit Template" : "New Template"}</p>
                    {selectedTemplateId && (
                      <button type="button" onClick={() => void removeTemplate()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-red-400/60 hover:text-red-400/90 transition-colors" style={{ border: "1px solid rgba(255,100,100,0.12)" }}>
                        {Ico.trash} Delete
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <AdminInput label="ID"    value={templateForm.id}      onChange={(v) => setTemplateForm((f) => ({ ...f, id: v }))} />
                    <AdminInput label="Proposal ID" value={String(templateForm.proposalId)} type="number" onChange={(v) => setTemplateForm((f) => ({ ...f, proposalId: Number(v) || 0 }))} />
                    <AdminInput label="Name"  value={templateForm.name}    onChange={(v) => setTemplateForm((f) => ({ ...f, name: v }))} />
                    <AdminInput label="Tagline" value={templateForm.tagline} onChange={(v) => setTemplateForm((f) => ({ ...f, tagline: v }))} />
                    <AdminInput label="Image URL" value={templateForm.image} onChange={(v) => setTemplateForm((f) => ({ ...f, image: v }))} />
                    <AdminSelect label="Family" value={templateForm.family} options={["romantic","royal","dreamy"]} onChange={(v) => setTemplateForm((f) => ({ ...f, family: v as ProposalTemplate["family"] }))} />
                    <AdminSelect label="Relationship" value={templateForm.relationshipType} options={["GF","Crush","Wife"]} onChange={(v) => setTemplateForm((f) => ({ ...f, relationshipType: v as ProposalTemplate["relationshipType"] }))} />
                  </div>
                  <AdminTextarea label="Description" value={templateForm.description} onChange={(v) => setTemplateForm((f) => ({ ...f, description: v }))} />
                  <button type="button" onClick={() => void saveTemplate()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.14em] uppercase font-medium transition-opacity hover:opacity-85" style={{ background: "linear-gradient(135deg,#c9a84c,#8a6e28)", color: "#060400" }}>
                    {Ico.check} Save Template
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── PLANS ── */}
        {tab === "plans" && (
          <main className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-72 shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-4 pt-5 pb-3 flex items-center justify-between">
                <SectionHeading eyebrow="Pricing" title="Plans" compact />
                <button type="button" onClick={() => { setSelectedPlanId(""); setPlanForm(emptyPlan); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-amber-500/70 hover:text-amber-500 transition-colors" style={{ border: "1px solid rgba(201,168,76,0.18)" }}>
                  {Ico.plus} New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-1.5">
                {plans.map((p) => (
                  <button key={p.id} type="button" onClick={() => handlePlanSelect(p.id)} className="w-full text-left px-3 py-3 rounded-xl transition-all" style={selectedPlanId === p.id
                    ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" }
                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }
                  }>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[#f0e8d8] text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{p.label || "Untitled"}</p>
                      <span className="text-amber-500/60 text-[0.6rem]">₹{p.price}</span>
                    </div>
                    <p className="text-white/25 text-[0.58rem] mt-0.5">{p.hours}h · {p.allTemplateAccess ? "All access" : "Limited"}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 min-w-0">
              <div className="max-w-xl">
                <div className="p-5 rounded-2xl mb-4" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#f0e8d8] text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{selectedPlanId ? "Edit Plan" : "New Plan"}</p>
                    {selectedPlanId && (
                      <button type="button" onClick={() => void removePlan()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-red-400/60 hover:text-red-400/90 transition-colors" style={{ border: "1px solid rgba(255,100,100,0.12)" }}>
                        {Ico.trash} Delete
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <AdminInput label="ID"    value={planForm.id}           onChange={(v) => setPlanForm((f) => ({ ...f, id: v as PublishPlan["id"] }))} />
                    <AdminInput label="Label" value={planForm.label}        onChange={(v) => setPlanForm((f) => ({ ...f, label: v }))} />
                    <AdminInput label="Hours" value={String(planForm.hours)} type="number" onChange={(v) => setPlanForm((f) => ({ ...f, hours: Number(v) || 0 }))} />
                    <AdminInput label="Price" value={String(planForm.price)} type="number" onChange={(v) => setPlanForm((f) => ({ ...f, price: Number(v) || 0 }))} />
                  </div>
                  <AdminTextarea label="Description" value={planForm.description} onChange={(v) => setPlanForm((f) => ({ ...f, description: v }))} />
                  <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
                    <input type="checkbox" checked={planForm.allTemplateAccess} onChange={(e) => setPlanForm((f) => ({ ...f, allTemplateAccess: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                    <span className="text-white/50 text-xs">Unlock all templates for this plan</span>
                  </label>
                  <button type="button" onClick={() => void savePlan()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.14em] uppercase font-medium transition-opacity hover:opacity-85" style={{ background: "linear-gradient(135deg,#c9a84c,#8a6e28)", color: "#060400" }}>
                    {Ico.check} Save Plan
                  </button>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.14)" }}>
                  <p className="text-amber-500/60 text-[0.58rem] tracking-[0.2em] uppercase mb-1.5">Plan Summary</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    <span className="text-[#f0e8d8]">{planForm.label || "Untitled"}</span> gives <span className="text-[#f0e8d8]">{planForm.hours}h</span> of access at <span className="text-[#f0e8d8]">₹{planForm.price}</span>.{" "}
                    {planForm.allTemplateAccess ? "All templates unlock." : "Only the purchased template unlocks."}
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── DRAFT / PUBLISHED ── */}
        {tab === "proposals" && (
          <main className="flex-1 flex overflow-hidden">
            <div className="w-80 shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-4 pt-5 pb-3 flex items-center justify-between">
                <SectionHeading eyebrow="Dynamic" title="Proposals" compact />
                <button type="button" onClick={() => { setSelectedManagedProposalId(""); setManagedProposalForm(emptyManagedProposal); setManagedProposalJson(JSON.stringify(emptyManagedProposal.proposal, null, 2)); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-amber-500/70 hover:text-amber-500 transition-colors" style={{ border: "1px solid rgba(201,168,76,0.18)" }}>
                  {Ico.plus} New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-1.5">
                {managedProposals.map((proposal) => (
                  <button key={proposal.id} type="button" onClick={() => handleManagedProposalSelect(proposal.id)} className="w-full text-left px-3 py-3 rounded-xl transition-all" style={selectedManagedProposalId === proposal.id ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" } : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[#f0e8d8] text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{proposal.title || "Untitled"}</p>
                      <StateTag state={proposal.status === "published" ? "Active" : "Draft"} tiny />
                    </div>
                    <p className="text-white/25 text-[0.6rem] mt-0.5 truncate">/{proposal.slug}</p>
                    <p className="text-white/18 text-[0.55rem] mt-1 uppercase tracking-[0.1em]">{proposal.proposalType} · {proposal.templateId || "no-template"}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 min-w-0">
              <div className="max-w-4xl flex flex-col gap-4">
                <div className={`h-44 rounded-2xl ${(managedProposalForm.coverImage || managedProposalForm.proposal.heroImage) ? "" : `bg-gradient-to-br ${templateGradient((managedProposalForm.themeFamily || "romantic") as ProposalTemplate["family"])}`} relative overflow-hidden flex flex-col justify-end p-4`}
                  style={(managedProposalForm.coverImage || managedProposalForm.proposal.heroImage) ? { background: `linear-gradient(rgba(10,8,4,0.22), rgba(10,8,4,0.78)), url(${managedProposalForm.coverImage || managedProposalForm.proposal.heroImage}) center/cover` } : undefined}>
                  <p className="text-white/40 text-[0.58rem] tracking-[0.18em] uppercase relative z-10">{managedProposalForm.proposalType || "story"} · {managedProposalForm.status}</p>
                  <h3 className="text-2xl font-light relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>{managedProposalForm.title || "Proposal Title"}</h3>
                  <p className="text-white/40 text-xs italic relative z-10">/{managedProposalForm.slug || "proposal-slug"}</p>
                </div>

                <div className="p-5 rounded-2xl" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#f0e8d8] text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{selectedManagedProposalId ? "Edit Proposal" : "New Proposal"}</p>
                    <div className="flex items-center gap-2">
                      {managedProposalForm.slug && <a href={`/proposal?managed=${encodeURIComponent(managedProposalForm.slug)}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-[0.62rem] tracking-[0.1em] uppercase text-amber-500/70 hover:text-amber-500 transition-colors" style={{ border: "1px solid rgba(201,168,76,0.18)" }}>Open View</a>}
                      {selectedManagedProposalId && <button type="button" onClick={() => void removeManagedProposal()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.6rem] tracking-[0.1em] uppercase text-red-400/60 hover:text-red-400/90 transition-colors" style={{ border: "1px solid rgba(255,100,100,0.12)" }}>{Ico.trash} Delete</button>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <AdminInput label="ID" value={managedProposalForm.id} onChange={(v) => setManagedProposalForm((f) => ({ ...f, id: v }))} />
                    <AdminInput label="Slug" value={managedProposalForm.slug} onChange={(v) => setManagedProposalForm((f) => ({ ...f, slug: v.toLowerCase().replace(/\s+/g, "-") }))} />
                    <AdminInput label="Title" value={managedProposalForm.title} onChange={(v) => setManagedProposalForm((f) => ({ ...f, title: v }))} />
                    <AdminInput label="Proposal Type" value={managedProposalForm.proposalType} onChange={(v) => setManagedProposalForm((f) => ({ ...f, proposalType: v }))} />
                    <AdminInput label="Template ID" value={managedProposalForm.templateId} onChange={(v) => setManagedProposalForm((f) => ({ ...f, templateId: v }))} />
                    <AdminInput label="Cover Image" value={managedProposalForm.coverImage} onChange={(v) => setManagedProposalForm((f) => ({ ...f, coverImage: v }))} />
                    <AdminSelect label="Theme" value={managedProposalForm.themeFamily || ""} options={["","romantic","royal","dreamy"]} onChange={(v) => setManagedProposalForm((f) => ({ ...f, themeFamily: v as ManagedProposal["themeFamily"] }))} />
                    <AdminSelect label="Status" value={managedProposalForm.status} options={["published","draft"]} onChange={(v) => setManagedProposalForm((f) => ({ ...f, status: v as ManagedProposal["status"] }))} />
                  </div>
                  <AdminTextarea label="Proposal JSON" value={managedProposalJson} onChange={setManagedProposalJson} rows={18} />
                  <button type="button" onClick={() => void saveManagedProposal()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs tracking-[0.14em] uppercase font-medium transition-opacity hover:opacity-85" style={{ background: "linear-gradient(135deg,#c9a84c,#8a6e28)", color: "#060400" }}>{Ico.check} Save Proposal</button>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function SectionHeading({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return (
    <div className={compact ? "mb-0" : "mb-6"}>
      <p className="text-amber-500/60 text-[0.58rem] tracking-[0.28em] uppercase mb-1">{eyebrow}</p>
      <h2 className={`font-light leading-tight ${compact ? "text-xl" : "text-3xl"}`} style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>{title}</h2>
    </div>
  );
}

function SidePanel({ title, badge, badgeActive = false, children }: { title: string; badge?: string; badgeActive?: boolean; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[#f0e8d8] text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</p>
        {badge && (
          <span className="text-[0.55rem] tracking-[0.14em] uppercase px-2 py-0.5 rounded-md" style={badgeActive
            ? { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.24)", color: "#c9a84c" }
            : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.28)" }
          }>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex flex-col gap-2" style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase mb-1">{title}</p>
      {children}
    </div>
  );
}

function IRow({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="text-white/22 text-[0.58rem]">{l}</span>
      <span className="text-[#f0e8d8] text-xs text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}

function StateTag({ state, tiny = false }: { state: "Active" | "Expired" | "Draft"; tiny?: boolean }) {
  const base = `${tiny ? "text-[0.52rem]" : "text-[0.58rem]"} tracking-[0.12em] uppercase px-2 py-0.5 rounded-md`;
  if (state === "Active")  return <span className={base} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)", color: "#c9a84c" }}>Active</span>;
  if (state === "Expired") return <span className={base} style={{ background: "rgba(255,100,100,0.07)", border: "1px solid rgba(255,100,100,0.18)", color: "#ff9e7a" }}>Expired</span>;
  return <span className={base} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.28)" }}>Draft</span>;
}

function EmptySlate({ title, text }: { title: string; text: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 mx-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="12" y2="12"/></svg>
      </div>
      <h3 className="text-lg font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>{title}</h3>
      <p className="text-white/25 text-xs">{text}</p>
    </div>
  );
}

function AdminInput({ label, value, onChange, type = "text", placeholder, onEnter }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; onEnter?: () => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0e8d8" }}
        onFocus={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5 mb-3">
      <span className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0e8d8" }}
        onFocus={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
      />
    </label>
  );
}

function AdminSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-white/25 text-[0.55rem] tracking-[0.18em] uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0e8d8" }}
      >
        {options.map((o) => <option key={o} value={o} style={{ background: "#0d0b08" }}>{o}</option>)}
      </select>
    </label>
  );
}
