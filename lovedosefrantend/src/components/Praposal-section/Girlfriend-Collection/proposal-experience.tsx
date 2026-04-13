"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { type ManagedProposal } from "@/lib/managed-proposals";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { loadProposal, loadPublishedProposal, type PhotoItem, type ProposalData } from "@/lib/proposal-storage";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";
import { DEFAULT_TEMPLATE_RENDERER, resolveTemplateRendererKey } from "@/lib/template-renderers";

// ── Types ─────────────────────────────────────────────────────────────────────
const emptyState: ProposalData = {
  boyName: "", girlName: "", message: "", relationshipType: "GF", templateId: "",
  howWeMet: "", firstMeetingDate: "", nickname: "", whyILoveYou: "", futureDreams: "",
  heroImage: "", heroImageCaption: "", gallery: [], voiceNote: "",
  publishDurationId: "", publishDurationLabel: "", publishHours: 0, publishPrice: 0,
  allTemplateAccess: false, purchasedTemplateIds: [], publishExpiresAt: "",
  customerDetails: { fullName: "", email: "", phone: "", occasion: "", notes: "", password: "" },
};

// ── Per-family theme tokens ───────────────────────────────────────────────────
const THEMES = {
  romantic: {
    bg: ["#000000", "#0f0f0f", "#050505"],
    accentHex: "#d4af37",
    accentSoft: "rgba(212,175,55,0.12)",
    accentBorder: "rgba(212,175,55,0.24)",
    accentText: "#f0d060",
    gold: "#f6dc8c",
    timerBg: "#0a0a0a",
    scanColor: "rgba(212,175,55,0.3)",
    particleColors: ["#d4af37", "#f0d060", "#f6dc8c", "#ffffff", "#b8960c"],
    heroOverlay: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)",
    ctaBg: "linear-gradient(135deg,#d4af37,#b8960c)",
    ctaGlow: "rgba(212,175,55,0.38)",
    symbol: "♥",
    label: "Romantic",
    questionText: "Will you open this forever with me?",
  },
  royal: {
    bg: ["#050505", "#121212", "#000000"],
    accentHex: "#d4af37",
    accentSoft: "rgba(212,175,55,0.1)",
    accentBorder: "rgba(212,175,55,0.22)",
    accentText: "#f6dc8c",
    gold: "#f3cd58",
    timerBg: "#0c0c0c",
    scanColor: "rgba(212,175,55,0.25)",
    particleColors: ["#d4af37", "#f0d060", "#ffffff", "#f6dc8c", "#b8960c"],
    heroOverlay: "linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.4) 45%, rgba(5,5,5,0.05) 100%)",
    ctaBg: "linear-gradient(135deg,#d4af37,#b8960c)",
    ctaGlow: "rgba(212,175,55,0.35)",
    symbol: "✦",
    label: "Royal",
    questionText: "Shall we make this love our legacy?",
  },
  dreamy: {
    bg: ["#0b0b0b", "#16120a", "#050505"],
    accentHex: "#d4af37",
    accentSoft: "rgba(212,175,55,0.1)",
    accentBorder: "rgba(212,175,55,0.2)",
    accentText: "#e7c55b",
    gold: "#f6dc8c",
    timerBg: "#090909",
    scanColor: "rgba(212,175,55,0.25)",
    particleColors: ["#d4af37", "#e7c55b", "#f6dc8c", "#ffffff", "#8c6d12"],
    heroOverlay: "linear-gradient(to top, rgba(11,11,11,1) 0%, rgba(11,11,11,0.4) 45%, rgba(11,11,11,0.05) 100%)",
    ctaBg: "linear-gradient(135deg,#d4af37,#8c6d12)",
    ctaGlow: "rgba(212,175,55,0.34)",
    symbol: "✶",
    label: "Dreamy",
    questionText: "Can I call you my brightest star now?",
  },
} as const;

type Family = keyof typeof THEMES;

const NO_CONFIGS = [
  { label: "No", pos: { top: "8%", right: "6%" } },
  { label: "Are you sure?", pos: { bottom: "14%", left: "6%" } },
  { label: "Think again 🥺", pos: { top: "50%", right: "4%" } },
  { label: "Please reconsider…", pos: { bottom: "28%", right: "9%" } },
  { label: "Don't break my heart", pos: { top: "22%", left: "5%" } },
];

// ── Floating particle canvas ──────────────────────────────────────────────────
function ParticleField({ family }: { family: Family }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = THEMES[family];
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const isCompactViewport = window.innerWidth < 768;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: isCompactViewport ? 24 : 40 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -0.00015 - Math.random() * 0.0002,
      alpha: 0.15 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
    }));
    let t = 0;
    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(t + p.phase));
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [family, theme.particleColors]);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── Live timer ────────────────────────────────────────────────────────────────
function useLoveTimer(d: string) {
  const [t, setT] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!d) return;
    const calc = () => {
      const diff = Date.now() - new Date(d).getTime();
      if (diff < 0) return;
      const td = Math.floor(diff / 86400000);
      setT({ years: Math.floor(td / 365), months: Math.floor((td % 365) / 30), days: td % 30, hours: Math.floor((diff % 86400e3) / 3.6e6), minutes: Math.floor((diff % 3.6e6) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [d]);
  return t;
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Rev({ children, delay = 0, from = "bottom" }: { children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right" | "scale" }) {
  const tf = { bottom: "translateY(48px)", left: "translateX(-40px)", right: "translateX(40px)", scale: "scale(0.88)" };
  return (
    <motion.div
      initial={{ opacity: 0, transform: tf[from] }}
      whileInView={{ opacity: 1, transform: "none" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  );
}

// ── Voice player ──────────────────────────────────────────────────────────────
function VoicePlayer({ src, family }: { src: string; family: Family }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const theme = THEMES[family];
  useEffect(() => {
    const a = ref.current; if (!a) return;
    const up = () => a.duration && setProg((a.currentTime / a.duration) * 100);
    const end = () => setPlaying(false);
    a.addEventListener("timeupdate", up); a.addEventListener("ended", end);
    return () => { a.removeEventListener("timeupdate", up); a.removeEventListener("ended", end); };
  }, []);
  const toggle = async () => {
    const a = ref.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { await a.play(); setPlaying(true); }
  };
  return (
    <Rev>
      <div style={{ padding: "1.8rem 2rem", borderRadius: 20, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText, marginBottom: "1.2rem" }}>🎙 Voice Note</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button type="button" onClick={() => void toggle()} style={{
            width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer",
            background: theme.ctaBg, color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 24px ${theme.ctaGlow}`,
          }}>{playing ? "⏸" : "▶"}</button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${prog}%`, background: theme.ctaBg, transition: "width 0.1s" }} />
            </div>
            <p style={{ marginTop: 8, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{playing ? "Playing…" : "Tap to listen"}</p>
          </div>
        </div>
        <audio ref={ref} src={src} style={{ display: "none" }} />
      </div>
    </Rev>
  );
}

// ── Digit tile ────────────────────────────────────────────────────────────────
function Digit({ v, label, accent }: { v: number; label: string; accent: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {String(v).padStart(2, "0")}
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, marginTop: 6, opacity: 0.7 }}>{label}</div>
    </div>
  );
}

// ── Story panel ───────────────────────────────────────────────────────────────
function StoryPanel({ icon, label, text, accent, accentSoft, accentBorder, delay }: {
  icon: string; label: string; text: string; accent: string; accentSoft: string; accentBorder: string; delay: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Rev delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: "2rem", borderRadius: 20,
          background: hov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hov ? accentBorder : "rgba(255,255,255,0.06)"}`,
          transition: "all 0.3s ease", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: hov ? `linear-gradient(90deg,transparent,${accentSoft.replace("0.1", "0.5")},transparent)` : "transparent", transition: "background 0.3s" }} />
        <div style={{ fontSize: 22, marginBottom: "1rem" }}>{icon}</div>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", opacity: 0.85 }}>{label}</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.85 }}>{text}</p>
      </div>
    </Rev>
  );
}

// ── Gallery item ──────────────────────────────────────────────────────────────
function GalleryItem({ item }: { item: PhotoItem }) {
  const [hov, setHov] = useState(false);
  return (
    <Rev>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ breakInside: "avoid", marginBottom: "1.2rem", borderRadius: 18, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img src={item.image} alt={item.caption || ""} loading="lazy" decoding="async" style={{ width: "100%", display: "block", transition: "transform 0.7s ease", transform: hov ? "scale(1.04)" : "scale(1)" }} />
        {item.caption && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem 1.2rem 1rem", background: "linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)", opacity: hov ? 1 : 0.7, transition: "opacity 0.35s" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{item.caption}</p>
          </div>
        )}
      </div>
    </Rev>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProposalExperience() {
  const searchParams = useSearchParams();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [managedProposal, setManagedProposal] = useState<ManagedProposal | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [noIdx, setNoIdx] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [CustomRenderer, setCustomRenderer] = useState<ComponentType<TemplateRendererProps> | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);

  useEffect(() => {
    const updateHeroProgress = () => {
      const hero = heroRef.current;

      if (!hero) {
        return;
      }

      const rect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const totalDistance = Math.max(rect.height, 1);
      const travelled = Math.min(Math.max(-rect.top, 0), totalDistance);
      const progress = Math.min(Math.max(travelled / (totalDistance + viewportHeight * 0.2), 0), 1);

      setHeroProgress((current) => Math.abs(current - progress) > 0.01 ? progress : current);
    };

    let frame = 0;
    const scheduleHeroProgress = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateHeroProgress();
      });
    };

    updateHeroProgress();
    window.addEventListener("scroll", scheduleHeroProgress, { passive: true });
    window.addEventListener("resize", scheduleHeroProgress);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleHeroProgress);
      window.removeEventListener("resize", scheduleHeroProgress);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const managedSlug = searchParams.get("managed");
    const previewMode = searchParams.get("preview") === "1";
    Promise.all([
      managedSlug
        ? fetch(`/api/proposals/${encodeURIComponent(managedSlug)}`).then((response) => response.ok ? response.json() : { proposal: null })
        : previewMode
          ? loadProposal()
          : loadPublishedProposal(),
      fetch("/api/templates").then((response) => response.json()),
    ]).then(([data, templateResponse]) => {
      if (!cancelled && managedSlug && data?.proposal) {
        setManagedProposal(data.proposal);
        setProposal(data.proposal.proposal);
      }
      if (!cancelled && !managedSlug && data) setProposal(data as ProposalData);
      if (!cancelled) setTemplates(templateResponse.templates ?? []);
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [searchParams]);

  const hasProposal = useMemo(() => Boolean(proposal.boyName && proposal.girlName && proposal.message), [proposal]);
  const gallery = useMemo(() => proposal.gallery.filter(g => g.image.trim()), [proposal.gallery]);
  const timer = useLoveTimer(proposal.firstMeetingDate);
  const hasPublishingSetup = Boolean(
    proposal.publishDurationId &&
    proposal.customerDetails.fullName &&
    proposal.customerDetails.email &&
    proposal.customerDetails.phone &&
    proposal.customerDetails.password,
  );
  const isPreviewMode = searchParams.get("preview") === "1";
  const previewTemplateId = searchParams.get("templateId") ?? "";

  const tpl = templates.find(
    (template) => template.id === (isPreviewMode && previewTemplateId ? previewTemplateId : managedProposal?.templateId || proposal.templateId),
  ) ?? null;
  const rendererKey = resolveTemplateRendererKey(tpl);
  const family: Family = ((managedProposal?.themeFamily || tpl?.family) as Family) ?? "romantic";
  const theme = THEMES[family];
  const parallaxY = `${heroProgress * 28}%`;
  const heroFade = 1 - Math.min(heroProgress / 0.75, 1);

  useEffect(() => {
    let cancelled = false;

    if (!rendererKey || rendererKey === DEFAULT_TEMPLATE_RENDERER) {
      setCustomRenderer(null);
      return () => {
        cancelled = true;
      };
    }

    import(`../${rendererKey}`)
      .then((module) => {
        if (cancelled) {
          return;
        }

        const loadedRenderer = module.default as ComponentType<TemplateRendererProps> | undefined;
        setCustomRenderer(() => loadedRenderer ?? null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setCustomRenderer(null);
      });

    return () => {
      cancelled = true;
    };
  }, [rendererKey]);

  const handleAccept = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
    setTimeout(() => setAccepted(true), 300);
    await confetti({ particleCount: 200, spread: 130, startVelocity: 52, origin: { y: 0.55 }, colors: [...theme.particleColors] });
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#070006", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "rgba(255,255,255,0.6)", animation: "spin 1.2s linear infinite" }} />
    </div>
  );

  if (!hasProposal) return (
    <div style={{ minHeight: "100vh", background: "#07000c", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth: 400, textAlign: "center", padding: "3rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🔒</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f5f0e8", marginBottom: "0.8rem" }}>No proposal found</h1>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginBottom: "2rem" }}>Fill the form and pick a template first.</p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", borderRadius: 999 }}>← Back to form</Link>
      </div>
    </div>
  );

  if (!hasPublishingSetup && !isPreviewMode) return (
    <div style={{ minHeight: "100vh", background: "#07000c", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth: 460, textAlign: "center", padding: "3rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>⏳</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f5f0e8", marginBottom: "0.8rem" }}>Publish setup pending</h1>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginBottom: "2rem", lineHeight: 1.7 }}>
          Publish duration aur customer details complete karo, tab final proposal preview open hoga.
        </p>
        <Link href="/publish-plan" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", border: "1px solid rgba(212,175,55,0.24)", color: "#d4af37", fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", borderRadius: 999 }}>
          Open Publish Setup
        </Link>
      </div>
    </div>
  );

  const bgGrad = `radial-gradient(ellipse 80% 60% at 20% 0%, ${theme.bg[0]} 0%, ${theme.bg[1]} 45%, ${theme.bg[2]} 100%)`;

  if (CustomRenderer) {
    return <CustomRenderer proposal={proposal} template={tpl} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: bgGrad, color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;600;700;800&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:${theme.accentHex}44;border-radius:3px}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.13)}28%{transform:scale(1)}42%{transform:scale(1.08)}}
        @keyframes scanLine{0%{top:-5%}100%{top:105%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ripple{0%{transform:translate(-50%,-50%) scale(0);opacity:0.5}100%{transform:translate(-50%,-50%) scale(12);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      <ParticleField family={family} />

      {/* Ambient glow blobs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "55vw", height: "55vw", borderRadius: "50%", background: `radial-gradient(circle,${theme.accentHex}0f 0%,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "45vw", height: "45vw", borderRadius: "50%", background: `radial-gradient(circle,${theme.accentHex}08 0%,transparent 65%)` }} />
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: `${theme.bg[0]}cc`, backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.45)", fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
          ← Change Template
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: theme.ctaBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: `0 0 12px ${theme.ctaGlow}` }}>{theme.symbol}</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.accentText }}>{theme.label} · {tpl?.name ?? "Default"}</span>
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(255,255,255,0.25)" }}>
          {proposal.boyName} & {proposal.girlName}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-end", overflow: "hidden", paddingTop: "4rem" }}>
        <motion.div style={{ position: "absolute", inset: 0, y: parallaxY }}>
          {proposal.heroImage ? (
            <img src={proposal.heroImage} alt="" style={{ width: "100%", height: "115%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "115%", background: `linear-gradient(160deg,${theme.bg[0]} 0%,${theme.bg[1]} 60%,${theme.bg[2]} 100%)` }}>
              {/* Pattern */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(0deg,${theme.accentHex},${theme.accentHex} 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,${theme.accentHex},${theme.accentHex} 1px,transparent 1px,transparent 80px)` }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(5rem,20vw,16rem)", fontWeight: 300, color: `${theme.accentHex}08`, lineHeight: 1, letterSpacing: "-0.05em", userSelect: "none", whiteSpace: "nowrap" }}>LOVE</div>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: theme.heroOverlay }} />
        </motion.div>

        <motion.div style={{ position: "relative", zIndex: 2, width: "100%", padding: "0 2rem 5rem", opacity: heroFade }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "5px 16px 5px 10px", borderRadius: 999, border: `1px solid ${theme.accentBorder}`, background: theme.accentSoft, marginBottom: "2rem" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: theme.ctaBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: `0 0 10px ${theme.ctaGlow}` }}>{theme.symbol}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: theme.accentText }}>{proposal.nickname ? `For ${proposal.nickname}` : `A ${theme.label} Story`}</span>
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35 }} style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(3.5rem,10vw,8rem)", lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: "2rem",
            }}>
              Hey,<br />
              <em style={{
                background: `linear-gradient(135deg,${theme.gold},${theme.accentText},${theme.gold})`,
                backgroundSize: "300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 5s ease infinite",
              }}>{proposal.girlName}</em>
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: theme.ctaBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#fff", fontStyle: "italic", boxShadow: `0 0 20px ${theme.ctaGlow}` }}>
                {proposal.boyName.charAt(0)}
              </div>
              <div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>From</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.8)" }}>{proposal.boyName}</p>
              </div>
              {proposal.heroImageCaption && <p style={{ marginLeft: "auto", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", maxWidth: 260, textAlign: "right" }}>{proposal.heroImageCaption}</p>}
            </motion.div>
          </div>
        </motion.div>
      </section>

         {/* ── LOVE MESSAGE ─────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 2rem", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "4rem", alignItems: "center" }}>
          <Rev from="left">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
              <div style={{ width: 28, height: 1, background: theme.accentHex }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText }}>01 / The Letter</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Words written<br />only <em style={{ color: theme.accentText }}>for you</em>
            </h2>
          </Rev>
          <Rev from="right" delay={0.1}>
            <div style={{ borderLeft: `3px solid ${theme.accentHex}`, paddingLeft: "2rem" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.05rem,2.2vw,1.35rem)", color: "rgba(255,255,255,0.82)", lineHeight: 1.9, marginBottom: "1.5rem" }}>
                &ldquo;{proposal.message}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.ctaBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>{proposal.boyName.charAt(0)}</div>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{proposal.boyName}</span>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── TIMER ────────────────────────────────────────────────────── */}
      {proposal.firstMeetingDate && (
        <section style={{ padding: "5rem 2rem", background: theme.timerBg, position: "relative", zIndex: 1, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${theme.scanColor},transparent)`, animation: "scanLine 7s linear infinite" }} />
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Rev>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "3rem" }}>
                <div style={{ width: 28, height: 1, background: theme.accentHex }} />
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText }}>02 / Time Together</span>
              </div>
            </Rev>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "end" }}>
              <Rev from="left">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.2, marginBottom: "1rem" }}>
                  Every second of <em style={{ color: theme.accentText }}>us</em>,<br />counted live
                </h2>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  Since {new Date(proposal.firstMeetingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </Rev>
              <Rev from="right" delay={0.1}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
                  {[
                    ...(timer.years > 0 ? [{ v: timer.years, l: "Years" }] : []),
                    ...(timer.months > 0 ? [{ v: timer.months, l: "Months" }] : []),
                    { v: timer.days, l: "Days" }, { v: timer.hours, l: "Hours" }, { v: timer.minutes, l: "Mins" }, { v: timer.seconds, l: "Secs" },
                  ].slice(0, 6).map(({ v, l }) => (
                    <div key={l} style={{ borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: "1rem" }}>
                      <Digit v={v} label={l} accent={theme.accentText} />
                    </div>
                  ))}
                </div>
              </Rev>
            </div>
          </div>
        </section>
      )}

      {/* ── STORY PANELS ─────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Rev>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "3.5rem" }}>
              <div style={{ width: 28, height: 1, background: theme.accentHex }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText }}>03 / Our Story</span>
            </div>
          </Rev>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "1.2rem" }}>
            <StoryPanel icon="🌸" label="How We Met" text={proposal.howWeMet || "A beautiful beginning."} accent={theme.accentText} accentSoft={theme.accentSoft} accentBorder={theme.accentBorder} delay={0} />
            <StoryPanel icon="💗" label="Why I Love You" text={proposal.whyILoveYou || "For a thousand reasons."} accent={theme.accentText} accentSoft={theme.accentSoft} accentBorder={theme.accentBorder} delay={0.1} />
            <StoryPanel icon="✨" label="Future Dreams" text={proposal.futureDreams || "Everything ahead of us."} accent={theme.accentText} accentSoft={theme.accentSoft} accentBorder={theme.accentBorder} delay={0.2} />
          </div>
        </div>
      </section>
   
   
 {/* ── GALLERY ──────────────────────────────────────────────────── */}
{gallery.length > 0 && (
  <section style={{ padding: "0 2rem 6rem", position: "relative", zIndex: 1 }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      
      <Rev>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "3rem" }}>
          <div style={{ width: 28, height: 1, background: theme.accentHex }} />
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 8,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.accentText,
            }}
          >
            {proposal.voiceNote ? "05" : "04"} / Memories
          </span>
        </div>
      </Rev>

      {/* ✅ GRID START */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // 3 images per row
          gap: "1.2rem",
        }}
      >
        {gallery.map((item) => (
          <GalleryItem key={item.id} item={item} />
        ))}
      </div>
      {/* ✅ GRID END */}

    </div>
  </section>
)}
      {/* ── VOICE ────────────────────────────────────────────────────── */}
      {proposal.voiceNote && (
        <section style={{ padding: "0 2rem 5rem", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
              <div style={{ width: 28, height: 1, background: theme.accentHex }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText }}>04 / Voice</span>
            </div>
            <VoicePlayer src={proposal.voiceNote} family={family} />
          </div>
        </section>
      )}


      {/* ── PROPOSAL CARD ────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 2rem 8rem", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <Rev>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "3rem", textAlign: "center", justifyContent: "center" }}>
              <div style={{ width: 28, height: 1, background: theme.accentHex }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accentText }}>The Question</span>
              <div style={{ width: 28, height: 1, background: theme.accentHex }} />
            </div>
          </Rev>

          <Rev delay={0.08}>
            {/* Gradient border wrapper */}
            <div style={{ position: "relative", padding: 1, borderRadius: 28, background: `linear-gradient(135deg,${theme.accentHex}99,${theme.accentHex}33,${theme.accentHex}66)` }}>
              <div style={{ position: "relative", borderRadius: 27, background: `linear-gradient(160deg,${theme.bg[0]} 0%,${theme.bg[1]} 100%)`, padding: "clamp(2rem,5vw,3.5rem)", textAlign: "center", overflow: "hidden" }}>
                {/* top shimmer */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${theme.accentHex}88,transparent)` }} />

                <AnimatePresence mode="wait">
                  {!accepted ? (
                    <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.15, marginBottom: "1rem" }}>
                        {theme.questionText.replace("?", ",")}
                        <br /><em style={{ color: theme.accentText }}>{proposal.girlName}?</em>
                      </h2>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.35)", marginBottom: "3rem", fontSize: "1rem" }}>
                        One answer. One lifetime.
                      </p>

                      <div style={{ position: "relative", minHeight: 110 }}>
                        <button onClick={(e) => void handleAccept(e)} style={{
                          position: "relative", overflow: "hidden", padding: "14px 52px", borderRadius: 999, border: "none", cursor: "pointer",
                          background: theme.ctaBg, color: "#fff", fontFamily: "'Syne', sans-serif",
                          fontSize: "0.82rem", letterSpacing: "0.22em", fontWeight: 700, textTransform: "uppercase",
                          boxShadow: `0 0 40px ${theme.ctaGlow}, 0 8px 24px rgba(0,0,0,0.3)`,
                        }}>
                          {ripples.map(r => <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "ripple 0.7s ease forwards", transform: "translate(-50%,-50%) scale(0)", pointerEvents: "none" }} />)}
                          Yes, Forever {theme.symbol}
                        </button>

                        <button key={noIdx} onMouseEnter={() => setNoIdx(i => (i + 1) % NO_CONFIGS.length)} onClick={() => setNoIdx(i => (i + 1) % NO_CONFIGS.length)}
                          style={{
                            position: "absolute", ...NO_CONFIGS[noIdx].pos,
                            padding: "7px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.25)", cursor: "not-allowed", fontFamily: "'Syne', sans-serif",
                            fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
                            animation: "slideUp 0.3s ease both", whiteSpace: "nowrap",
                          }}>{NO_CONFIGS[noIdx].label}</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="a" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 160 }}>
                      <div style={{ fontSize: "5rem", marginBottom: "1.5rem", animation: "heartbeat 2s infinite" }}>💗</div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.2, marginBottom: "1rem" }}>
                        <em style={{ color: theme.accentText }}>{proposal.girlName}</em> said YES!
                      </h2>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.45)", marginBottom: "2rem" }}>
                        {proposal.boyName} is the happiest person in the universe right now.
                      </p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
                        {["💗", "🌸", "✨", "💍", "✨", "🌸", "💗"].map((e, i) => <span key={i} style={{ fontSize: 22, animation: `float ${1.4 + i * 0.18}s ease infinite ${i * 0.1}s` }}>{e}</span>)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "2.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.15)", fontSize: "0.9rem" }}>
          {proposal.boyName} & {proposal.girlName} — always.
        </p>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)" }}>
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </footer>
    </div>
  );
}





