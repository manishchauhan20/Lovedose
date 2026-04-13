"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type ProposalTemplate3Props = TemplateRendererProps;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/* ─────────────────────────────────────────────
   Luxury Color Palette - Warm & Sophisticated
───────────────────────────────────────────── */
const C = {
  // Warm neutrals
  cream: "#FAF7F2",
  creamDark: "#F5F0E8",
  warmWhite: "#FFFCF8",
  
  // Primary - Terracotta/Rust (sophisticated, warm)
  terracotta: "#C65D3B",
  terracottaLight: "#E07B5A",
  terracottaDark: "#A84A2D",
  
  // Secondary - Sage Green (natural, calming)
  sage: "#8B9D83",
  sageLight: "#A8B8A0",
  sageDark: "#6E7D67",
  
  // Accent - Champagne Gold
  champagne: "#D4AF37",
  champagneLight: "#E8C547",
  
  // Text
  charcoal: "#2C2420",
  charcoalLight: "#4A403A",
  charcoalMuted: "#8B7E75",
  
  // Effects
  shadow: "rgba(44, 36, 32, 0.08)",
  shadowHeavy: "rgba(44, 36, 32, 0.15)",
  glass: "rgba(255, 252, 248, 0.85)",
} as const;

/* ─────────────────────────────────────────────
   Global CSS - Editorial Style
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}

@keyframes lineGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.08); }
  28% { transform: scale(1); }
  42% { transform: scale(1.05); }
}
`;

/* ─────────────────────────────────────────────
   Animated Counter Component
───────────────────────────────────────────── */
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <span>{displayValue.toLocaleString()}</span>;
}

/* ─────────────────────────────────────────────
   Grain Texture Overlay
───────────────────────────────────────────── */
function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        animation: "grain 8s steps(10) infinite",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Floating Elements
───────────────────────────────────────────── */
function FloatingElements() {
  const elements = [
    { icon: "✦", color: C.terracotta, size: 24, top: "15%", left: "10%", delay: 0 },
    { icon: "❋", color: C.sage, size: 32, top: "25%", right: "15%", delay: 0.5 },
    { icon: "✦", color: C.champagne, size: 20, top: "60%", left: "8%", delay: 1 },
    { icon: "❋", color: C.terracottaLight, size: 28, top: "70%", right: "12%", delay: 1.5 },
    { icon: "✦", color: C.sageLight, size: 16, top: "40%", right: "8%", delay: 2 },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 0.4, 
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            opacity: { duration: 1, delay: el.delay },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: el.delay },
            rotate: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: el.delay },
          }}
          style={{
            position: "absolute",
            ...el,
            fontSize: el.size,
            color: el.color,
            filter: "blur(0.5px)",
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section Label - Editorial Style
───────────────────────────────────────────── */
function SectionLabel({ number, text }: { number: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: C.terracotta,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(198, 93, 59, 0.2)" }} />
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
          fontStyle: "italic",
          color: C.charcoalMuted,
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component - Editorial Layout
───────────────────────────────────────────── */
export default function ProposalTemplate3({
  proposal,
  template,
}: ProposalTemplate3Props) {
  const gallery = proposal.gallery.filter((i) => i.image.trim()).slice(0, 6);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const days = proposal.firstMeetingDate ? daysSince(proposal.firstMeetingDate) : 0;
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const handleYes = () => {
    setAnswered(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.cream,
        color: C.charcoal,
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style>{CSS}</style>
      <GrainOverlay />
      <FloatingElements />

      {/* Ambient Background Shapes */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.terracotta}08 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.sage}08 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ══ NAVIGATION ══ */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "24px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(to bottom, ${C.cream} 0%, transparent 100%)`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 500,
                color: C.charcoal,
                letterSpacing: "-0.02em",
              }}
            >
              Our Story
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/dashboard"
              style={{
                padding: "10px 24px",
                borderRadius: 30,
                border: `1px solid ${C.charcoalMuted}40`,
                color: C.charcoalLight,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.3s ease",
                background: C.glass,
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.terracotta;
                e.currentTarget.style.color = C.terracotta;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${C.charcoalMuted}40`;
                e.currentTarget.style.color = C.charcoalLight;
              }}
            >
              Change Template
            </Link>
          </motion.div>
        </nav>

        {/* ══ HERO SECTION - Asymmetric Editorial Layout ══ */}
        <section style={{ minHeight: "100vh", padding: "120px 48px 80px", display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }}>
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 20px",
                    background: C.warmWhite,
                    borderRadius: 30,
                    marginBottom: 32,
                    boxShadow: `0 4px 20px ${C.shadow}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>💌</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: C.terracotta,
                    }}
                  >
                    A Love Letter
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(56px, 6vw, 84px)",
                    fontWeight: 300,
                    lineHeight: 1.05,
                    marginBottom: 24,
                    color: C.charcoal,
                  }}
                >
                  My Dearest
                  <br />
                  <span style={{ fontStyle: "italic", color: C.terracotta }}>
                    {proposal.girlName}
                  </span>
                </h1>

                <div
                  style={{
                    width: 80,
                    height: 2,
                    background: `linear-gradient(to right, ${C.terracotta}, ${C.sage})`,
                    marginBottom: 32,
                  }}
                />

                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: C.charcoalLight,
                    maxWidth: 480,
                    marginBottom: 40,
                    fontWeight: 300,
                  }}
                >
                  {proposal.message}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${C.terracotta}, ${C.terracottaLight})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.warmWhite,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 24,
                      fontWeight: 600,
                      boxShadow: `0 8px 30px ${C.terracotta}40`,
                    }}
                  >
                    {proposal.boyName.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: C.charcoalMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      From your loving husband
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 500, color: C.charcoal }}>{proposal.boyName}</p>
                  </div>
                </div>
              </motion.div>

              {/* Right Image - Editorial Style */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    position: "relative",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: `0 30px 60px ${C.shadowHeavy}`,
                  }}
                >
                  {proposal.heroImage ? (
                    <img
                      src={proposal.heroImage}
                      alt="Us"
                      style={{ width: "100%", height: 600, objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 600,
                        background: `linear-gradient(135deg, ${C.creamDark}, ${C.sage}20)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: 64, color: C.terracotta }}
                      >
                        ♥
                      </motion.div>
                      <span style={{ color: C.charcoalMuted, fontStyle: "italic" }}>Your Photo Here</span>
                    </div>
                  )}
                  
                  {/* Overlay Caption */}
                  {proposal.heroImageCaption && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "40px 30px 30px",
                        background: "linear-gradient(transparent, rgba(44, 36, 32, 0.7))",
                      }}
                    >
                      <p
                        style={{
                          color: C.cream,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 18,
                          fontStyle: "italic",
                        }}
                      >
                        {proposal.heroImageCaption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -30,
                    padding: "20px 28px",
                    background: C.warmWhite,
                    borderRadius: 16,
                    boxShadow: `0 10px 40px ${C.shadow}`,
                  }}
                >
                  <p style={{ fontSize: 12, color: C.charcoalMuted, marginBottom: 4 }}>Together Since</p>
                  <p style={{ fontSize: 20, fontWeight: 600, color: C.terracotta }}>
                    {proposal.firstMeetingDate ? formatDate(proposal.firstMeetingDate) : "Forever"}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ STATS SECTION ══ */}
        <section style={{ padding: "80px 48px", background: C.warmWhite }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <SectionLabel number="01" text="Our Journey in Numbers" />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {[
                { label: "Days Together", value: days, suffix: "" },
                { label: "Memories Made", value: 999, suffix: "+" },
                { label: "Love Level", value: 100, suffix: "%" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  style={{
                    textAlign: "center",
                    padding: "40px 30px",
                    background: C.cream,
                    borderRadius: 20,
                    border: `1px solid rgba(198, 93, 59, 0.1)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(48px, 5vw, 64px)",
                      fontWeight: 300,
                      color: C.terracotta,
                      marginBottom: 8,
                    }}
                  >
                    {stat.value === 999 ? (
                      <span>∞</span>
                    ) : (
                      <>
                        <AnimatedNumber value={stat.value} />
                        {stat.suffix}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: C.charcoalMuted, letterSpacing: "0.05em" }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STORY SECTION - Magazine Layout ══ */}
        <section style={{ padding: "100px 48px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <SectionLabel number="02" text="Chapters of Us" />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
              {[
                {
                  num: "I",
                  title: "How We Met",
                  content: proposal.howWeMet || "In a world of billions, our paths crossed. Some call it chance, I call it destiny.",
                  color: C.terracotta,
                },
                {
                  num: "II",
                  title: "Why I Love You",
                  content: proposal.whyILoveYou || "For the way you laugh, for your kindness, for making every day feel like home.",
                  color: C.sage,
                },
                {
                  num: "III",
                  title: "Our Future",
                  content: proposal.futureDreams || "Hand in hand, building a lifetime of moments. Forever is just the beginning.",
                  color: C.champagne,
                },
              ].map((chapter, i) => (
                <motion.div
                  key={chapter.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8 }}
                  style={{ position: "relative" }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 120,
                      fontWeight: 300,
                      color: `${chapter.color}15`,
                      position: "absolute",
                      top: -40,
                      left: -10,
                      lineHeight: 1,
                    }}
                  >
                    {chapter.num}
                  </span>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 28,
                        fontWeight: 400,
                        marginBottom: 16,
                        color: C.charcoal,
                      }}
                    >
                      {chapter.title}
                    </h3>
                    <div
                      style={{
                        width: 40,
                        height: 2,
                        background: chapter.color,
                        marginBottom: 20,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 16,
                        lineHeight: 1.8,
                        color: C.charcoalLight,
                        fontWeight: 300,
                      }}
                    >
                      {chapter.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ GALLERY - Masonry Style ══ */}
        {gallery.length > 0 && (
          <section style={{ padding: "100px 48px", background: C.creamDark }}>
            <div style={{ maxWidth: 1400, margin: "0 auto" }}>
              <SectionLabel number="03" text="Captured Moments" />
              
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gridAutoRows: 280,
                  gap: 20,
                }}
              >
                {gallery.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    style={{
                      gridColumn: idx === 0 ? "span 2" : idx === 3 ? "span 2" : "span 1",
                      gridRow: idx === 0 ? "span 2" : "span 1",
                      borderRadius: 16,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: `0 10px 30px ${C.shadow}`,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.caption || "Memory"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {item.caption && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(transparent 50%, rgba(44, 36, 32, 0.8))",
                          display: "flex",
                          alignItems: "flex-end",
                          padding: 24,
                        }}
                      >
                        <p
                          style={{
                            color: C.cream,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 16,
                            fontStyle: "italic",
                          }}
                        >
                          {item.caption}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ THE QUESTION - Centerpiece ══ */}
        <section style={{ padding: "120px 48px", position: "relative" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel number="04" text="The Question" />
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{
                background: C.warmWhite,
                borderRadius: 32,
                padding: "60px 48px",
                boxShadow: `0 40px 80px ${C.shadowHeavy}`,
                border: `1px solid rgba(198, 93, 59, 0.1)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Elements */}
              <div
                style={{
                  position: "absolute",
                  top: -100,
                  left: -100,
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${C.terracotta}08 0%, transparent 70%)`,
                }}
              />
              
              <AnimatePresence mode="wait">
                {!answered ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.terracotta}20, ${C.sage}20)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 32px",
                        fontSize: 48,
                        border: `2px solid ${C.terracotta}30`,
                      }}
                    >
                      💍
                    </motion.div>

                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(32px, 5vw, 48px)",
                        fontWeight: 400,
                        lineHeight: 1.3,
                        marginBottom: 24,
                        color: C.charcoal,
                      }}
                    >
                      Will you continue this beautiful journey with me,
                      <br />
                      <span style={{ fontStyle: "italic", color: C.terracotta }}>
                        my love?
                      </span>
                    </h2>

                    <p
                      style={{
                        fontSize: 18,
                        color: C.charcoalLight,
                        marginBottom: 40,
                        fontWeight: 300,
                        lineHeight: 1.7,
                      }}
                    >
                      Every day with you is a gift. I promise to cherish you, support you, and love you for all the days of my life.
                    </p>

                    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleYes}
                        style={{
                          padding: "18px 48px",
                          borderRadius: 30,
                          border: "none",
                          background: `linear-gradient(135deg, ${C.terracotta}, ${C.terracottaLight})`,
                          color: C.warmWhite,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: `0 10px 30px ${C.terracotta}40`,
                          letterSpacing: "0.05em",
                        }}
                      >
                        Yes, Forever ♥
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "18px 48px",
                          borderRadius: 30,
                          border: `2px solid ${C.sage}`,
                          background: "transparent",
                          color: C.sage,
                          fontSize: 16,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.sage;
                          e.currentTarget.style.color = C.warmWhite;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = C.sage;
                        }}
                      >
                        Let me think...
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answered"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ fontSize: 80, marginBottom: 24 }}
                    >
                      💕
                    </motion.div>
                    
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 42,
                        fontWeight: 400,
                        color: C.terracotta,
                        marginBottom: 16,
                      }}
                    >
                      She Said Yes!
                    </h2>
                    
                    <p
                      style={{
                        fontSize: 18,
                        color: C.charcoalLight,
                        lineHeight: 1.7,
                        marginBottom: 32,
                      }}
                    >
                      {proposal.girlName} has made {proposal.boyName} the happiest person alive.
                      <br />
                      Here's to forever, my love.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                      {["🥂", "💍", "🏠", "✨", "🌹"].map((emoji, i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -10, 0] }}
                          transition={{ 
                            duration: 2, 
                            delay: i * 0.2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          style={{ fontSize: 32 }}
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer
          style={{
            padding: "60px 48px",
            borderTop: `1px solid rgba(198, 93, 59, 0.1)`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              fontStyle: "italic",
              color: C.charcoalMuted,
              marginBottom: 8,
            }}
          >
            {proposal.boyName} & {proposal.girlName}
          </p>
          <p style={{ fontSize: 13, color: C.charcoalMuted, letterSpacing: "0.1em" }}>
            EST. {proposal.firstMeetingDate ? new Date(proposal.firstMeetingDate).getFullYear() : "FOREVER"}
          </p>
        </footer>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  y: window.innerHeight + 100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{ 
                  y: -100,
                  rotate: Math.random() * 720 - 360,
                  x: Math.random() * window.innerWidth,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  fontSize: Math.random() * 20 + 20,
                  color: [C.terracotta, C.sage, C.champagne][Math.floor(Math.random() * 3)],
                }}
              >
                {["✦", "❋", "✿", "♥", "✨"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}