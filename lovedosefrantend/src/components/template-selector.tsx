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

// Enhanced Icons
const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconSparkles = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconCrown = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 16l7-7 7 7M5 16v4h14v-4M5 16l2.5-10h9L19 16" />
  </svg>
);

// Enhanced Template Card Component
function TemplateCard({
  template,
  isSelected,
  isBusy,
  onView,
  onPurchase,
  index,
}: {
  template: ProposalTemplate;
  isSelected: boolean;
  isBusy: boolean;
  onView: (id: string) => void;
  onPurchase: (id: string) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-3xl overflow-hidden transition-all duration-700 ease-out ${
        isSelected ? "ring-2 ring-[#d4af37] shadow-[0_0_60px_rgba(212,175,55,0.3)]" : ""
      }`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ 
            backgroundImage: template.image
              ? `url(${template.image})`
              : "linear-gradient(135deg, #1a1a2e 0%, #0f0f0f 100%)"
          }}
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90" />
        <div className={`absolute inset-0 bg-[#d4af37]/0 transition-colors duration-500 ${isHovered ? 'bg-[#d4af37]/10' : ''}`} />
        
        {/* Floating Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isSelected && (
            <span className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <IconCheck /> Selected
            </span>
          )}
          {template.isPremium && (
            <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-medium tracking-wider uppercase flex items-center gap-1.5">
              <IconCrown /> Premium
            </span>
          )}
        </div>

        {/* Quick Action Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => onView(template.id)}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wider uppercase hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <IconEye /> Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 -mt-12">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-2xl">{template.icon || "✦"}</span>
        </div>

        <h3 className="font-display text-2xl text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-500">
          {template.name}
        </h3>
        
        <p className="font-body text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
          {template.description || "A beautifully crafted template for your special moment"}
        </p>

        {/* Features Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(template.features || ["Responsive", "Customizable", "HD Quality"]).slice(0, 3).map((feature, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 tracking-wider uppercase"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onPurchase(template.id)}
          disabled={isBusy}
          className={`w-full py-4 rounded-xl font-medium text-xs tracking-[0.2em] uppercase transition-all duration-500 flex items-center justify-center gap-2 ${
            isSelected 
              ? "bg-[#d4af37] text-black hover:bg-[#f4d03f]" 
              : "bg-white/5 text-white border border-white/10 hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37]"
          } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isBusy ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isSelected ? (
            <>Selected <IconCheck /></>
          ) : (
            <>Select Template <IconArrowRight /></>
          )}
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute -inset-px rounded-3xl bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 transition-all duration-700 ${isHovered ? 'from-[#d4af37]/20 via-[#d4af37]/10 to-[#d4af37]/20' : ''} pointer-events-none`} />
    </div>
  );
}

// Enhanced Collection Card Component
function CollectionCard({ item }: { item: ManagedProposal }) {
  return (
    <div 
      className="group relative rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a]/80 hover:border-[#d4af37]/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(212,175,55,0.15)]"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ 
            backgroundImage: item.coverImage 
              ? `url(${item.coverImage})`
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        
        {/* Top Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white/80 tracking-wider uppercase">
            {item.proposalType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 -mt-12">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/20 flex items-center justify-center mb-4">
          <IconSparkles />
        </div>
        
        <h3 className="font-display text-xl text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-500 line-clamp-1">
          {item.title}
        </h3>
        
        <p className="font-body text-xs text-white/40 mb-4 line-clamp-2">
          Created with love and care for your special moment
        </p>

        <Link 
          href={`/proposal?managed=${encodeURIComponent(item.slug)}`}
          className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] transition-all duration-500 font-body text-xs tracking-[0.15em] uppercase group/link"
        >
          <span>View Proposal</span>
          <span className="w-6 h-6 rounded-full border border-[#d4af37]/30 flex items-center justify-center group-hover/link:bg-[#d4af37] group-hover/link:text-black transition-all duration-300">
            <IconArrowRight />
          </span>
        </Link>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4af37]/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16 group-hover:translate-x-14 group-hover:-translate-y-14 transition-transform duration-500" />
      </div>
    </div>
  );
}

export function TemplateSelector() {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingTemplateId, setSavingTemplateId] = useState("");
  const [managedProposals, setManagedProposals] = useState<ManagedProposal[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      if (cancelled) return;
      if (data) setProposal(data);
      setTemplates(templateResponse.templates ?? []);
      setManagedProposals(managedResponse.proposals ?? []);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const hasProposal = Boolean(proposal.boyName.trim() && proposal.girlName.trim() && proposal.message.trim());
  const activeTemplate = templates.find((template) => template.id === proposal.templateId) ?? null;

  const saveTemplateSelection = async (templateId: string) => {
    if (savingTemplateId) return null;
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
    if (!next) return;
    router.push(`/proposal?preview=1&templateId=${encodeURIComponent(templateId)}`);
  };

  const purchaseTemplate = async (templateId: string) => {
    const next = await saveTemplateSelection(templateId);
    if (!next) return;
    router.push("/publish-plan");
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#050505_70%)]" />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] bg-gradient-to-r from-[#d4af37] to-[#f4d03f] transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 border border-[#d4af37]/20 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-2 border border-[#d4af37]/40 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
            <div className="absolute inset-4 border border-[#d4af37]/60 rounded-full animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#d4af37] text-3xl animate-pulse">✦</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display italic text-2xl text-[#d4af37] mb-2">Curating Excellence</p>
            <p className="font-body text-xs text-white/40 tracking-[0.3em] uppercase">Loading Templates</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasProposal) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8b4513]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-lg w-full">
          <div className="text-center p-12 rounded-[2.5rem] border border-[#d4af37]/20 bg-gradient-to-b from-[#0a0a0a] to-[#050505] shadow-[0_0_80px_rgba(212,175,55,0.15)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(212,175,55,0.03)_50%,transparent_60%)] animate-shimmer" />
            
            <div className="w-28 h-28 mx-auto mb-10 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/30 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-[#d4af37]/10 animate-pulse" />
              <svg className="w-12 h-12 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h1 className="font-display text-5xl font-light mb-4 text-white tracking-tight">
              Begin Your <span className="text-[#d4af37] italic">Journey</span>
            </h1>
            <p className="font-body text-sm text-white/40 leading-relaxed mb-12 max-w-xs mx-auto">
              Create a timeless proposal by sharing your story, names, and heartfelt message
            </p>
            
            <Link 
              href="/" 
              className="group relative inline-flex items-center gap-3 px-10 py-5 overflow-hidden rounded-full"
            >
              <span className="absolute inset-0 border border-[#d4af37] rounded-full group-hover:bg-[#d4af37] transition-all duration-500" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              <span className="relative text-[#d4af37] group-hover:text-black font-body text-sm tracking-[0.2em] uppercase font-medium transition-colors duration-500">
                Start Creating
              </span>
              <svg className="relative w-5 h-5 text-[#d4af37] group-hover:text-black transition-all duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#d4af37]/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#8b4513]/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050505_70%)]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)`,
        backgroundSize: '100px 100px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Elegant Navigation */}
        <nav className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center mb-12 sm:mb-20">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link 
              href="/" 
              className="group flex items-center gap-3 text-white/50 hover:text-[#d4af37] transition-all duration-500 font-body text-sm"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-[#d4af37]/50 flex items-center justify-center transition-all duration-500 group-hover:bg-[#d4af37]/10">
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="tracking-wider uppercase text-xs font-medium">Return</span>
            </Link>
            
            {proposal.customerDetails.email && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <Link 
                  href="/dashboard" 
                  className="group flex items-center gap-3 text-[#d4af37] hover:text-[#f4d03f] transition-all duration-500 font-body text-sm"
                >
                  <div className="w-12 h-12 rounded-full border border-[#d4af37]/30 group-hover:border-[#d4af37] flex items-center justify-center transition-all duration-500 bg-[#d4af37]/5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <span className="tracking-wider uppercase text-xs font-medium">Dashboard</span>
                </Link>
              </>
            )}
          </div>

          {/* Couple Name Badge */}
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/[0.03] backdrop-blur-sm hover:border-[#d4af37]/40 transition-all duration-500 self-start lg:self-auto max-w-full">
            <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="font-display text-sm sm:text-lg text-white/90 break-words">
              {proposal.boyName} <span className="text-[#d4af37] mx-2 sm:mx-3 italic text-base sm:text-xl">&</span> {proposal.girlName}
            </span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="text-center mb-16 sm:mb-24 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 sm:-top-16 w-px h-20 sm:h-32 bg-gradient-to-b from-transparent via-[#d4af37]/50 to-transparent" />
          
          <div className="inline-flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 animate-float max-w-full">
            <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="font-body text-[11px] tracking-[0.4em] uppercase text-[#d4af37]/70 font-medium">Select Your Design</span>
            <div className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-normal mb-6 sm:mb-8 leading-[0.9] sm:leading-[0.85]">
            <span className="block text-white/90 mb-2">Choose</span>
            <span className="block text-[#d4af37] italic">Elegance</span>
          </h1>

          <p className="max-w-2xl mx-auto font-body text-white/40 text-sm sm:text-lg leading-relaxed mb-10 sm:mb-16 px-2">
            Preview your proposal in any template before making your selection. 
            Each design is crafted with precision to make your moment truly unforgettable.
          </p>

          {/* Action Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center justify-center gap-3 px-5 sm:px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-300 w-full sm:w-auto">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-body text-xs text-white/60 tracking-wider uppercase">Preview First</span>
            </div>
            <div className="hidden sm:block w-12 h-px bg-white/20" />
            <div className="flex items-center justify-center gap-3 px-5 sm:px-6 py-3 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/[0.03] hover:border-[#d4af37]/40 transition-all duration-300 w-full sm:w-auto">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-body text-xs text-[#d4af37] tracking-wider uppercase font-medium">Then Purchase</span>
            </div>
          </div>
        </header>

        {/* Selected Template Banner */}
        {activeTemplate && (
          <div className="mb-20 relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-[#d4af37]/10 rounded-3xl animate-shimmer" />
            <div className="relative p-5 sm:p-8 rounded-3xl border border-[#d4af37]/20 bg-[#0a0a0a]/50 backdrop-blur-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <IconCheck />
                </div>
                <div>
                  <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#d4af37]/60 mb-2 font-medium">Currently Selected</p>
                  <p className="font-display text-2xl sm:text-3xl text-white">{activeTemplate.name}</p>
                  <p className="font-body text-sm text-white/40 mt-1">{activeTemplate.description}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => viewTemplate(activeTemplate.id)}
                  className="px-6 py-3 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 font-body text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <IconEye /> Preview
                </button>
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37]">
                  <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  <span className="font-body text-xs tracking-wider uppercase font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <StatCard 
            label="Available Templates" 
            value={String(templates.length)} 
            icon={IconSparkles}
          />
          <StatCard 
            label="Your Collection" 
            value={String(managedProposals.length)} 
            icon={IconCrown}
          />
          <StatCard 
            label="Selected" 
            value={activeTemplate ? "1" : "0"} 
            icon={IconCheck}
          />
        </div> */}

        {/* Saved Proposals Section */}
        {managedProposals.length > 0 && (
          <section className="mb-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 flex items-center justify-center">
                  <IconCrown />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-white mb-1">Your Collection</h2>
                  <p className="font-body text-xs text-white/40 tracking-[0.2em] uppercase">{managedProposals.length} Saved Proposals</p>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] transition-all duration-300 font-body text-xs tracking-[0.15em] uppercase self-start sm:self-auto"
              >
                View All
                <span className="w-8 h-8 rounded-full border border-[#d4af37]/30 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300">
                  <IconArrowRight />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {managedProposals.map((item) => (
                <CollectionCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Template Catalog */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#d4af37]" />
              <div>
                <h2 className="font-display text-3xl text-white mb-1">Template Gallery</h2>
                <p className="font-body text-xs text-white/40 tracking-[0.2em] uppercase">Choose from our premium collection</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-body text-xs text-white/60 tracking-wider uppercase">{templates.length} Available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={proposal.templateId === template.id}
                isBusy={savingTemplateId === template.id}
                onView={viewTemplate}
                onPurchase={purchaseTemplate}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-16 w-px h-16 bg-gradient-to-b from-[#d4af37]/50 to-transparent" />
          <p className="font-body text-xs text-white/30 tracking-[0.4em] uppercase mb-6">Need Help?</p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-3 text-[#d4af37] hover:text-[#f4d03f] transition-all duration-300 font-body text-sm tracking-wider uppercase group"
          >
            <span>Contact Support</span>
            <span className="w-10 h-10 rounded-full border border-[#d4af37]/30 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300">
              <IconArrowRight />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default TemplateSelector;


