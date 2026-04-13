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

// Enhanced Icons with better styling
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconKey = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="15" r="4" />
    <path d="M12 11l8-8M17 6l2 2" />
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconCrown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconUnlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
  </svg>
);

// Enhanced Template Card Component
function TemplateCard({
  template,
  isSelected,
  isIncluded,
  isActive,
  isPublishing,
  onView,
  onPublish,
  getPrimaryLabel,
}: {
  template: ProposalTemplate;
  isSelected: boolean;
  isIncluded: boolean;
  isActive: boolean;
  isPublishing: boolean;
  onView: (id: string) => void;
  onPublish: (id: string) => void;
  getPrimaryLabel: () => string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isSelected
          ? "ring-2 ring-[#c9a84c] shadow-[0_0_30px_rgba(201,168,76,0.3)]"
          : "hover:shadow-[0_0_40px_rgba(201,168,76,0.15)]"
      }`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/20 to-[#8b5cf6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        {template.image ? (
          <img
            src={template.image}
            alt={template.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1510] to-[#0f0b08]">
            <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 flex items-center justify-center">
              <IconSparkles />
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-[0.65rem] font-medium tracking-wider uppercase backdrop-blur-md ${
              isActive
                ? "bg-[#c9a84c] text-[#060400]"
                : isIncluded
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isActive ? "Active" : isIncluded ? "Unlocked" : "Locked"}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070604] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-[#f0e8d8] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {template.name}
            </h3>
            <p className="text-xs text-white/40 line-clamp-2">{template.description || "Premium proposal template"}</p>
          </div>
          {isActive && (
            <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <IconCheck />
            </div>
          )}
        </div>

        {/* Features Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.features?.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md text-[0.6rem] text-white/50 bg-white/5 border border-white/10"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(template.id)}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wider uppercase transition-all duration-300 hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Preview
          </button>
          <button
            onClick={() => onPublish(template.id)}
            disabled={isPublishing}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              isPublishing ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-[#c9a84c]/20"
            }`}
            style={{
              background: isIncluded
                ? "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)"
                : "rgba(255,255,255,0.1)",
              border: isIncluded ? "none" : "1px solid rgba(255,255,255,0.2)",
              color: isIncluded ? "#060400" : "rgba(255,255,255,0.6)",
            }}
          >
            {isPublishing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isIncluded ? (
              <IconUnlock />
            ) : (
              <IconLock />
            )}
            {getPrimaryLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Stats Card Component
function StatsCard({ title, value, subtitle, icon: Icon, gradient = false }: any) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{
        background: gradient
          ? "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)"
          : "rgba(255,255,255,0.03)",
        border: gradient ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            gradient ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "bg-white/5 text-white/60"
          }`}
        >
          <Icon />
        </div>
        {gradient && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-3xl -mr-16 -mt-16" />
        )}
      </div>
      <p className="text-white/40 text-[0.65rem] tracking-[0.2em] uppercase mb-1">{title}</p>
      <p className={`text-3xl font-light mb-1 ${gradient ? "text-[#c9a84c]" : "text-[#f0e8d8]"}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {value}
      </p>
      <p className="text-white/30 text-xs">{subtitle}</p>
    </div>
  );
}

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
      <main className="min-h-screen grid place-items-center" style={{ background: "#070604" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#c9a84c]/20 border-t-[#c9a84c] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[#c9a84c]/50 animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
          <p className="text-[#c9a84c]/60 text-xs tracking-[0.4em] uppercase font-light">
            Loading Dashboard
          </p>
        </div>
      </main>
    );
  }

  if (!canLogin) {
    return (
      <main className="min-h-screen grid place-items-center px-4" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-md w-full text-center relative">
          <div className="absolute inset-0 bg-[#c9a84c]/5 blur-3xl rounded-full" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center mx-auto mb-6">
              <IconKey />
            </div>
            <h1 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
              Setup Required
            </h1>
            <p className="text-sm text-white/40 leading-relaxed mb-8 max-w-xs mx-auto">
              Publish plan complete karo aur email/password set karo to access your premium dashboard.
            </p>
            <Link 
              href="/publish-plan" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs tracking-[0.15em] uppercase transition-all hover:shadow-lg hover:shadow-[#c9a84c]/20"
              style={{ 
                background: "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)", 
                color: "#060400",
                fontWeight: 500
              }}
            >
              Open Publish Plan <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Left Side - Enhanced Visual */}
        <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0b04] via-[#1a1206] to-[#0a0804]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(201,168,76,0.15),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 border border-[#c9a84c]/10 rounded-full" />
          <div className="absolute bottom-20 left-20 w-48 h-48 border border-[#c9a84c]/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/10 flex items-center justify-center">
                <IconCrown />
              </div>
              <p className="text-[#c9a84c] text-[0.7rem] tracking-[0.4em] uppercase font-medium">LoveDose</p>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/20 text-[0.65rem] tracking-[0.3em] uppercase mb-6">Premium Experience</p>
            <h2 className="text-6xl font-light leading-[1.1] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
              Your love story,
              <br />
              <span className="text-[#c9a84c] italic">beautifully crafted</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Access your premium templates and manage your proposal from one elegant place.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["#e07830", "#c9a84c", "#8b5cf6", "#ec4899"].map((color, index) => (
                <div 
                  key={index} 
                  className="w-10 h-10 rounded-full border-2 border-[#0f0b04] flex items-center justify-center text-xs shadow-lg"
                  style={{ background: color }}
                >
                  ♥
                </div>
              ))}
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">2,000+ Couples</p>
              <p className="text-white/30 text-xs">Trusted worldwide</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.03),transparent_70%)]" />
          <div className="w-full max-w-md relative">
            <div className="lg:hidden mb-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mx-auto mb-4">
                <IconCrown />
              </div>
              <p className="text-[#c9a84c] text-[0.7rem] tracking-[0.4em] uppercase">LoveDose</p>
            </div>

            <div className="mb-8">
              <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.3em] uppercase mb-2 font-medium">Welcome Back</p>
              <h1 className="text-4xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>Dashboard Login</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Apna publish-plan email aur password enter karo.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="group">
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-white/40 mb-2 font-medium group-focus-within:text-[#c9a84c] transition-colors">Email Address</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 rounded-xl text-sm font-light outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                  style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    color: "#f0e8d8" 
                  }}
                />
              </div>

              <div className="group">
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-white/40 mb-2 font-medium group-focus-within:text-[#c9a84c] transition-colors">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 pr-20 rounded-xl text-sm font-light outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                    style={{ 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid rgba(255,255,255,0.1)", 
                      color: "#f0e8d8" 
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword((value) => !value)} 
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-white/30 hover:text-[#c9a84c] text-[0.65rem] tracking-[0.1em] uppercase transition-colors font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}
              {mailStatus && (
                <div className="px-4 py-3 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs">
                  {mailStatus}
                </div>
              )}
              {actionStatus && (
                <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  {actionStatus}
                </div>
              )}

              <button 
                type="button" 
                onClick={handleLogin} 
                className="w-full py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/30 hover:scale-[1.02] mt-2"
                style={{ 
                  background: "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)", 
                  color: "#060400" 
                }}
              >
                Sign In to Dashboard
              </button>

              <button 
                type="button" 
                onClick={() => void handleForgotPassword()} 
                className="text-white/30 hover:text-[#c9a84c] text-xs text-center transition-colors pt-2 flex items-center justify-center gap-1"
              >
                Forgot password? <span className="underline">Send to email</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#070604", fontFamily: "'DM Sans', sans-serif", color: "#f0e8d8" }}>
      {/* Enhanced Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ 
          width: 260, 
          background: "linear-gradient(180deg, #0a0805 0%, #0d0b08 100%)", 
          borderRight: "1px solid rgba(201,168,76,0.1)",
          flexShrink: 0 
        }}
      >
        {/* Logo Area */}
        <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center">
              <IconCrown />
            </div>
            <div>
              <p className="text-[#c9a84c] text-[0.7rem] tracking-[0.3em] uppercase font-medium">LoveDose</p>
              <p className="text-white/30 text-[0.6rem] tracking-[0.15em] uppercase">Premium</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-6 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab("templates"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-[0.12em] uppercase transition-all duration-300 w-full text-left ${
              activeTab === "templates" 
                ? "text-[#c9a84c]" 
                : "text-white/40 hover:text-white/70"
            }`}
            style={activeTab === "templates"
              ? { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }
              : { border: "1px solid transparent", background: "transparent" }}
          >
            <IconGrid />
            <span className="font-medium">Templates</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("account"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-[0.12em] uppercase transition-all duration-300 w-full text-left ${
              activeTab === "account" 
                ? "text-[#c9a84c]" 
                : "text-white/40 hover:text-white/70"
            }`}
            style={activeTab === "account"
              ? { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }
              : { border: "1px solid transparent", background: "transparent" }}
          >
            <IconUser />
            <span className="font-medium">Account</span>
          </button>
          <Link
            href="/templates"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-[0.12em] uppercase transition-all duration-300 text-white/40 hover:text-white/70 hover:bg-white/5"
            style={{ border: "1px solid transparent" }}
          >
            <IconStar />
            <span className="font-medium">Browse All</span>
          </Link>
        </nav>

        {/* Plan Status Card */}
        <div className="mx-4 mb-4 p-4 rounded-2xl relative overflow-hidden" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a84c]/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <IconCrown />
              <p className="text-[#c9a84c] text-[0.6rem] tracking-[0.2em] uppercase font-medium">Current Plan</p>
            </div>
            <p className="text-[#f0e8d8] text-lg font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {proposal.publishDurationLabel || "No plan"}
            </p>
            <p className="text-white/30 text-[0.65rem] mb-3">{formatExpiry(proposal.publishExpiresAt)}</p>
            <div className={`text-[0.65rem] px-2 py-1.5 rounded-lg inline-block ${
              isPlanExpired 
                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                : hasMonthOrLongerAccess 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20"
            }`}>
              {isPlanExpired
                ? "Plan expired. Renew now."
                : hasMonthOrLongerAccess
                  ? "All templates unlocked"
                  : "Limited access"}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 pb-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 bg-gradient-to-br from-[#c9a84c]/30 to-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]">
              {proposal.customerDetails.fullName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-[#f0e8d8] text-sm font-medium truncate">{proposal.customerDetails.fullName || "User"}</p>
              <p className="text-white/30 text-[0.65rem] truncate">{proposal.customerDetails.email}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs tracking-[0.1em] uppercase w-full transition-all duration-300 hover:bg-white/5 text-white/40 hover:text-white/70"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Enhanced Header */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 backdrop-blur-xl" style={{ background: "rgba(7,6,4,0.9)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              className="lg:hidden p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors" 
              style={{ border: "1px solid rgba(255,255,255,0.1)" }} 
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <div>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">Dashboard</p>
              <p className="text-sm font-medium text-[#f0e8d8]">
                {activeTab === "templates" ? "Template Gallery" : "Account Settings"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <IconStar />
              <span className="text-[#c9a84c] text-xs font-medium">{activeCount} Templates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/40" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <IconGrid />
              <span className="text-xs">{templates.length} Total</span>
            </div>
          </div>
        </header>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <main className="flex-1 px-6 pt-8 pb-16 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Status Alerts */}
              {proposal.templateId && (
                <div className="mb-8 p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)", border: "1px solid rgba(201,168,76,0.25)" }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                      <IconCheck />
                    </div>
                    <div>
                      <p className="text-[#c9a84c] text-xs tracking-[0.15em] uppercase font-medium mb-0.5">Currently Active</p>
                      <p className="text-[#f0e8d8] text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {templates.find((template) => template.id === proposal.templateId)?.name || proposal.templateId}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => router.push("/proposal")} 
                    className="relative px-6 py-3 rounded-xl text-xs tracking-[0.1em] uppercase font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/20 flex items-center gap-2"
                    style={{ 
                      background: "rgba(201,168,76,0.2)", 
                      color: "#c9a84c", 
                      border: "1px solid rgba(201,168,76,0.3)" 
                    }}
                  >
                    <IconEye /> View Live
                  </button>
                </div>
              )}

              {(isPlanExpired || !hasMonthOrLongerAccess) && (
                <div className="mb-8 p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="relative">
                    <p className="text-white/60 text-xs tracking-[0.15em] uppercase font-medium mb-1">
                      {isPlanExpired ? "Access Locked" : "Limited Access"}
                    </p>
                    <p className="text-white/50 text-sm">
                      {isPlanExpired
                        ? "Time over hone ke baad sab templates locked ho gaye hain."
                        : "1 month se kam plan me sirf purchased template unlocked rahega."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPayment}
                    className="relative px-6 py-3 rounded-xl text-xs tracking-[0.1em] uppercase font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/20"
                    style={{ 
                      background: "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)", 
                      color: "#060400" 
                    }}
                  >
                    {isPlanExpired ? "Renew Now" : "Upgrade Plan"}
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatsCard
                  title="Available Templates"
                  value={`${activeCount}/${templates.length}`}
                  subtitle={hasMonthOrLongerAccess ? "Full access granted" : "Limited selection"}
                  icon={IconGrid}
                  gradient={hasMonthOrLongerAccess}
                />
                <StatsCard
                  title="Plan Status"
                  value={isPlanExpired ? "Expired" : "Active"}
                  subtitle={formatExpiry(proposal.publishExpiresAt)}
                  icon={IconClock}
                  gradient={!isPlanExpired}
                />
                <StatsCard
                  title="Template Type"
                  value={proposal.templateId ? "Premium" : "None"}
                  subtitle={proposal.templateId ? "Selected" : "No template chosen"}
                  icon={IconStar}
                  gradient={Boolean(proposal.templateId)}
                />
              </div>

              {/* Templates Grid */}
              <div className="mb-6">
                <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
                  Choose Your Template
                </h2>
                <p className="text-white/40 text-sm mb-8">Select a beautiful design for your special moment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                  
                    key={template.id}
                    template={template}
                    isSelected={proposal.templateId === template.id}
                    isIncluded={includedTemplateIds.includes(template.id)}
                    isActive={proposal.templateId === template.id}
                    isPublishing={publishingId === template.id}
                    onView={handleViewTemplate}
                    onPublish={includedTemplateIds.includes(template.id) ? handlePublish : handleOpenPayment}
                    getPrimaryLabel={() => {
                      if (publishingId === template.id) return "Publishing...";
                      if (includedTemplateIds.includes(template.id)) {
                        return proposal.templateId === template.id ? "Re-publish" : "Publish";
                      }
                      return isPlanExpired ? "Renew" : "Upgrade";
                    }}
                  />
                ))}
              </div>
            </div>
          </main>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <main className="flex-1 px-6 pt-8 pb-16 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.3em] uppercase mb-2 font-medium">Account</p>
                <h1 className="text-5xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
                  Your Profile
                </h1>
                <p className="text-white/40 text-sm">Manage your account details and subscription</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2 p-6 rounded-3xl relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="relative flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-light shrink-0 bg-gradient-to-br from-[#c9a84c]/30 to-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {proposal.customerDetails.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
                        {proposal.customerDetails.fullName || "—"}
                      </h2>
                      <p className="text-white/40 text-sm mb-4">{proposal.customerDetails.email}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-lg text-[0.65rem] tracking-wider uppercase bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                          Premium Member
                        </span>
                        {proposal.customerDetails.occasion && (
                          <span className="px-3 py-1.5 rounded-lg text-[0.65rem] tracking-wider uppercase bg-white/5 text-white/60 border border-white/10">
                            {proposal.customerDetails.occasion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {proposal.customerDetails.phone && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <p className="text-white/30 text-[0.6rem] tracking-[0.2em] uppercase mb-1">Phone</p>
                        <p className="text-[#f0e8d8] text-lg font-light">{proposal.customerDetails.phone}</p>
                      </div>
                    )}
                    {proposal.customerDetails.occasion && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <p className="text-white/30 text-[0.6rem] tracking-[0.2em] uppercase mb-1">Occasion</p>
                        <p className="text-[#f0e8d8] text-lg font-light">{proposal.customerDetails.occasion}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                        <IconCrown />
                      </div>
                      <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.2em] uppercase font-medium">Subscription</p>
                    </div>
                    
                    <p className="text-white/40 text-[0.6rem] tracking-[0.2em] uppercase mb-2">Current Plan</p>
                    <p className="text-3xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0e8d8" }}>
                      {proposal.publishDurationLabel || "No plan"}
                    </p>
                    
                    <div className="h-px bg-[#c9a84c]/20 mb-4" />
                    
                    <p className="text-white/40 text-[0.6rem] tracking-[0.2em] uppercase mb-2">Expires On</p>
                    <p className="text-lg text-[#f0e8d8] font-light mb-6">{formatExpiry(proposal.publishExpiresAt)}</p>
                    
                    <button
                      onClick={handleOpenPayment}
                      className="w-full py-3 rounded-xl text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/20"
                      style={{ 
                        background: "linear-gradient(135deg, #c9a84c 0%, #8a6e28 100%)", 
                        color: "#060400" 
                      }}
                    >
                      {isPlanExpired ? "Renew Plan" : "Upgrade Plan"}
                    </button>
                  </div>
                </div>

                {/* Access Stats */}
                <div className="lg:col-span-3 p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                      <IconKey />
                    </div>
                    <div>
                      <p className="text-[#c9a84c] text-[0.65rem] tracking-[0.2em] uppercase font-medium">Template Access</p>
                      <p className="text-white/40 text-xs">Your current permissions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-4xl font-light text-[#f0e8d8] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {hasMonthOrLongerAccess ? "All Premium" : isPlanExpired ? "No Access" : "Selected Only"}
                      </p>
                      <p className="text-white/40 text-sm">
                        {activeCount} of {templates.length} templates available
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-[#c9a84c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {Math.round((activeCount / (templates.length || 1)) * 100)}%
                      </div>
                      <p className="text-white/30 text-xs">Access Level</p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden bg-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${templates.length ? (activeCount / templates.length) * 100 : 0}%`,
                        background: "linear-gradient(90deg, #c9a84c, #8a6e28, #c9a84c)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s infinite"
                      }} 
                    />
                  </div>
                </div>

                {proposal.customerDetails.notes && (
                  <div className="lg:col-span-3 p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white/30 text-[0.6rem] tracking-[0.2em] uppercase mb-3">Special Notes</p>
                    <p className="text-white/60 text-sm leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      "{proposal.customerDetails.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default UserDashboard;
