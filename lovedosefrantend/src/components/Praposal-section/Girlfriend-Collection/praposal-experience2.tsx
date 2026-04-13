"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";
import { type PhotoItem } from "@/lib/proposal-storage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

/* ─────────────────────────────────────────────
   GSAP Registration
───────────────────────────────────────────── */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Props = TemplateRendererProps;

/* ─────────────────────────────────────────────
   Advanced Color System
───────────────────────────────────────────── */
const C = {
  bg: "#030108",
  card: "rgba(138,43,226,0.08)",
  purple: "#8B2BE2",
  cyan: "#00E5FF",
  gold: "#FFD166",
  pink: "#FF6EB4",
  text: "#F0F0FF",
  muted: "rgba(240,240,255,0.6)",
  borderP: "rgba(138,43,226,0.3)",
  borderC: "rgba(0,229,255,0.25)",
  borderG: "rgba(255,209,102,0.2)",
  glass: "rgba(255,255,255,0.03)",
} as const;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/* ─────────────────────────────────────────────
   Advanced Particle System with Mouse Interaction
───────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; 
    size: number; alpha: number; color: string;
    originalX: number; originalY: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#8B2BE2", "#00E5FF", "#FFD166", "#FF6EB4", "#B06AFF"];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const initParticles = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      particlesRef.current = Array.from({ length: 100 }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x, y, originalX: x, originalY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(3, 1, 8, 0.1)";
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        // Mouse interaction - magnetic effect
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          p.vx += dx * force * 0.001;
          p.vy += dy * force * 0.001;
        }

        // Return to original position
        p.vx += (p.originalX - p.x) * 0.001;
        p.vy += (p.originalY - p.y) * 0.001;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach(p2 => {
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist2 / 100) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    window.addEventListener("resize", initParticles);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", initParticles);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: "fixed", 
        inset: 0, 
        width: "100%", 
        height: "100%", 
        pointerEvents: "none", 
        zIndex: 0 
      }} 
    />
  );
}

/* ─────────────────────────────────────────────
   Magnetic Button Component
───────────────────────────────────────────── */
function MagneticButton({ children, onClick, className = "", variant = "primary" }: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${C.purple}, #A040F0)`,
      boxShadow: `0 0 30px rgba(138,43,226,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
      border: "none",
      color: "#fff",
    },
    secondary: {
      background: "transparent",
      border: `1px solid ${C.borderC}`,
      color: C.cyan,
      boxShadow: "none",
    },
    outline: {
      background: "transparent",
      border: `1px solid ${C.borderG}`,
      color: C.gold,
      boxShadow: "none",
    },
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 14,
        letterSpacing: 2,
        padding: "16px 42px",
        borderRadius: 4,
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s",
        transform: `translate(${position.x}px, ${position.y}px)`,
        ...variants[variant],
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   3D Tilt Card Component
───────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * 10,
      y: (x - 0.5) * -10,
    });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Typewriter Text Component
───────────────────────────────────────────── */
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span ref={containerRef}>
      {displayText}
      <span style={{ 
        display: "inline-block", 
        width: 2, 
        height: "1em", 
        background: C.cyan, 
        marginLeft: 4,
        animation: "blink 1s infinite",
        verticalAlign: "middle",
      }} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Timeline Component
───────────────────────────────────────────── */
function Timeline({ events }: { events: Array<{ date: string; title: string; desc: string }> }) {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timelineRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from(".timeline-item", {
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: -50,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={timelineRef} style={{ position: "relative", padding: "20px 0" }}>
      <div style={{
        position: "absolute",
        left: 20,
        top: 0,
        bottom: 0,
        width: 2,
        background: `linear-gradient(to bottom, ${C.purple}, ${C.cyan}, ${C.gold})`,
      }} />
      {events.map((event, idx) => (
        <div key={idx} className="timeline-item" style={{
          display: "flex",
          gap: 24,
          marginBottom: 32,
          paddingLeft: 48,
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            left: 12,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: C.bg,
            border: `2px solid ${idx % 2 === 0 ? C.cyan : C.purple}`,
            boxShadow: `0 0 10px ${idx % 2 === 0 ? C.cyan : C.purple}`,
          }} />
          <div style={{
            background: C.glass,
            backdropFilter: "blur(20px)",
            border: `1px solid ${C.borderP}`,
            borderRadius: 8,
            padding: 20,
            flex: 1,
          }}>
            <div style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 10,
              color: C.cyan,
              letterSpacing: 2,
              marginBottom: 8,
            }}>{event.date}</div>
            <div style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 16,
              color: C.gold,
              marginBottom: 8,
            }}>{event.title}</div>
            <p style={{
              fontSize: 14,
              color: C.muted,
              lineHeight: 1.6,
              margin: 0,
            }}>{event.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Parallax Hero Section
───────────────────────────────────────────── */
function ParallaxHero({ proposal }: { proposal: Props["proposal"] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 100,
        opacity: 0.5,
      });

      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: -50,
        scale: 1.1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <div ref={textRef} style={{ flex: 1, zIndex: 2 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,229,255,0.08)",
          border: `1px solid ${C.borderC}`,
          borderRadius: 4,
          padding: "8px 16px",
          marginBottom: 24,
          backdropFilter: "blur(10px)",
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: C.cyan,
            animation: "pulse 2s infinite",
          }} />
          <span style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: C.cyan,
            textTransform: "uppercase",
          }}>Final Quest Unlocked</span>
        </div>

        {/* Title with Typewriter */}
        <h1 style={{
          fontFamily: "'Cinzel',serif",
          fontSize: "clamp(36px,5vw,64px)",
          lineHeight: 1.1,
          fontWeight: 400,
          marginBottom: 20,
        }}>
          Dear
          <span style={{
            display: "block",
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: C.cyan,
            fontSize: "clamp(48px,7vw,84px)",
            textShadow: `0 0 60px rgba(0,229,255,0.5)`,
            marginTop: 8,
          }}>
            <TypewriterText text={proposal.girlName} delay={500} />
          </span>
        </h1>

        {/* Glass Message Card */}
        <TiltCard>
          <div style={{
            background: `linear-gradient(135deg, rgba(138,43,226,0.1), rgba(0,229,255,0.05))`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${C.borderP}`,
            borderRadius: 12,
            padding: "28px 32px",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.purple}, ${C.cyan}, transparent)`,
            }} />
            <p style={{
              fontSize: 17,
              lineHeight: 1.9,
              fontWeight: 300,
              color: C.muted,
              fontStyle: "italic",
              margin: 0,
            }}>{proposal.message}</p>
          </div>
        </TiltCard>

        {/* Profile Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cinzel',serif",
            fontSize: 20,
            color: "#fff",
            boxShadow: `0 0 20px rgba(138,43,226,0.4)`,
          }}>
            {proposal.boyName.charAt(0)}
          </div>
          <div>
            <div style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 9,
              letterSpacing: 2,
              color: "rgba(0,229,255,0.4)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}>From</div>
            <div style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 16,
              color: C.gold,
            }}>{proposal.boyName}</div>
          </div>
          {proposal.firstMeetingDate && (
            <>
              <div style={{ width: 1, height: 36, background: C.borderG }} />
              <div>
                <div style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9,
                  letterSpacing: 2,
                  color: "rgba(0,229,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}>Since</div>
                <div style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 16,
                  color: C.gold,
                }}>{formatDate(proposal.firstMeetingDate)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero Image with Parallax */}
      <div ref={imageRef} style={{
        flex: 1,
        position: "relative",
        height: "80vh",
        marginLeft: 60,
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${C.borderP}`,
          boxShadow: `0 25px 50px -12px rgba(138,43,226,0.25)`,
        }}>
          {proposal.heroImage ? (
            <img 
              src={proposal.heroImage} 
              alt="Us" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                filter: "brightness(0.9) contrast(1.1)",
              }} 
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, rgba(138,43,226,0.1), rgba(0,229,255,0.1))`,
            }}>
              <span style={{ fontSize: 48, animation: "heartbeat 2s infinite", color: C.purple }}>♥</span>
              <span style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                letterSpacing: 2,
                color: "rgba(0,229,255,0.3)",
                textTransform: "uppercase",
                marginTop: 16,
              }}>Your Photo Here</span>
            </div>
          )}
          
          {/* Corner Decorations */}
          {[
            { top: 20, left: 20, borderTop: `2px solid ${C.cyan}`, borderLeft: `2px solid ${C.cyan}` },
            { top: 20, right: 20, borderTop: `2px solid ${C.cyan}`, borderRight: `2px solid ${C.cyan}` },
            { bottom: 20, left: 20, borderBottom: `2px solid ${C.gold}`, borderLeft: `2px solid ${C.gold}` },
            { bottom: 20, right: 20, borderBottom: `2px solid ${C.gold}`, borderRight: `2px solid ${C.gold}` },
          ].map((style, i) => (
            <div key={i} style={{ position: "absolute", width: 40, height: 40, ...style }} />
          ))}
        </div>

        {/* Floating Caption */}
        {proposal.heroImageCaption && (
          <div style={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            background: C.glass,
            backdropFilter: "blur(20px)",
            border: `1px solid ${C.borderP}`,
            borderRadius: 8,
            padding: "12px 24px",
            whiteSpace: "nowrap",
          }}>
            <p style={{
              fontSize: 13,
              fontStyle: "italic",
              color: C.muted,
              margin: 0,
            }}>{proposal.heroImageCaption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated Stats Counter
───────────────────────────────────────────── */
function AnimatedCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = value;
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{
      background: `linear-gradient(135deg, rgba(138,43,226,0.1), rgba(0,229,255,0.05))`,
      backdropFilter: "blur(10px)",
      border: `1px solid ${C.borderP}`,
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`,
      }} />
      <div style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: 10,
        letterSpacing: 2,
        color: "rgba(0,229,255,0.5)",
        textTransform: "uppercase",
        marginBottom: 12,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 36,
        background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {count.toLocaleString("en-IN")}{suffix}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section Header with Animation
───────────────────────────────────────────── */
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 400, color: C.gold }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.borderG}, transparent)` }} />
      <span style={{ 
        fontFamily: "'Space Mono',monospace", 
        fontSize: 10, 
        color: "rgba(255,209,102,0.4)", 
        textTransform: "uppercase", 
        letterSpacing: 3 
      }}>{sub}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Flying particles on YES answer (Enhanced)
───────────────────────────────────────────── */
function spawnEnhancedParticles() {
  const symbols = ["♥", "✦", "★", "✧", "♦", "◆", "❦", "❥"];
  const colors = [C.purple, C.cyan, C.gold, C.pink, "#B06AFF", "#40F0FF"];
  
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const size = 16 + Math.random() * 32;
    const startX = Math.random() * window.innerWidth;
    
    Object.assign(el.style, {
      position: "fixed",
      zIndex: "9999",
      left: `${startX}px`,
      bottom: "-50px",
      fontSize: `${size}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: "none",
      textShadow: `0 0 20px currentColor`,
      animation: `particleFloat ${2 + Math.random() * 2}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
      animationDelay: `${Math.random() * 0.5}s`,
    });
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

/* ─────────────────────────────────────────────
   Global Styles & Keyframes
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.3); }
      28% { transform: scale(1); }
      42% { transform: scale(1.15); }
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    @keyframes particleFloat {
      0% { 
        transform: translateY(0) rotate(0deg) scale(1); 
        opacity: 1;
      }
      100% { 
        transform: translateY(-120vh) rotate(720deg) scale(0.3); 
        opacity: 0;
      }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${C.bg};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${C.purple};
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${C.cyan};
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function ProposalTemplateAdvanced({ proposal, template }: Props) {
  const gallery = proposal.gallery?.filter((item: PhotoItem) => item.image?.trim()).slice(0, 6) || [];
  const [answered, setAnswered] = useState(false);
  const days = proposal.firstMeetingDate ? daysSince(proposal.firstMeetingDate) : 0;

  const chaptersRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  // GSAP Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Chapters animation
      gsap.from(".chapter-card", {
        scrollTrigger: {
          trigger: chaptersRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 60,
        rotateX: 15,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Gallery animation
      gsap.from(".gallery-item", {
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 80%",
        },
        opacity: 0,
        scale: 0.8,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
      });

      // Question section animation
      gsap.from(questionRef.current, {
        scrollTrigger: {
          trigger: questionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const handleYesClick = useCallback(() => {
    setAnswered(true);
    spawnEnhancedParticles();
    
    // Additional celebration effect
    setTimeout(() => {
      const colors = [C.purple, C.cyan, C.gold];
      for (let i = 0; i < 30; i++) {
        const el = document.createElement("div");
        el.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[i % 3]};
          border-radius: 50%;
          left: 50%;
          top: 50%;
          pointer-events: none;
          z-index: 9999;
        `;
        document.body.appendChild(el);
        
        const angle = (i / 30) * Math.PI * 2;
        const velocity = 200 + Math.random() * 200;
        
        gsap.to(el, {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          opacity: 0,
          scale: 0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => el.remove(),
        });
      }
    }, 300);
  }, []);

  const timelineEvents = [
    { date: formatDate(proposal.firstMeetingDate) || "The Beginning", title: "First Meeting", desc: proposal.howWeMet || "Where our story began..." },
    { date: "Present", title: "Today", desc: "Creating memories together..." },
    { date: "Future", title: "Forever", desc: proposal.futureDreams || "Our journey continues..." },
  ];

  return (
    <div style={{ 
      background: `linear-gradient(180deg, ${C.bg} 0%, #050210 100%)`, 
      color: C.text, 
      minHeight: "100vh", 
      overflowX: "hidden", 
      position: "relative", 
      fontFamily: "'Cormorant Garamond',serif",
    }}>
      <GlobalStyles />
      <ParticleField />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px" }}>

        {/* ══ NAV ══ */}
        <nav style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "32px 0 24px", 
          borderBottom: `1px solid ${C.borderP}`,
          marginBottom: 40,
        }}>
          <Link href="/dashboard" style={{ 
            fontFamily: "'Space Mono',monospace", 
            fontSize: 11, 
            letterSpacing: 2, 
            color: "rgba(0,229,255,0.5)", 
            textDecoration: "none", 
            textTransform: "uppercase",
            transition: "color 0.3s",
          }}>
            ← Back to Dashboard
          </Link>
          <span style={{ 
            fontFamily: "'Space Mono',monospace", 
            fontSize: 11, 
            letterSpacing: 3, 
            color: "rgba(138,43,226,0.6)", 
            textTransform: "uppercase",
          }}>
            {template?.name || "Love Letter"}
          </span>
        </nav>

        {/* ══ HERO ══ */}
        <ParallaxHero proposal={proposal} />

        {/* ══ LOVE STATS ══ */}
        <section style={{ marginBottom: 100 }}>
          <SectionHeader title="Love Stats" sub="Analytics" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            <AnimatedCounter value={days} label="Days Together" />
            <AnimatedCounter value={100} label="Love Level" suffix="%" />
            <AnimatedCounter value={gallery.length * 100 + 500} label="Memories Created" suffix="+" />
          </div>
        </section>

        {/* ══ TIMELINE ══ */}
        <section style={{ marginBottom: 100 }}>
          <SectionHeader title="Our Journey" sub="Timeline" />
          <Timeline events={timelineEvents} />
        </section>

        {/* ══ CHAPTERS ══ */}
        <section ref={chaptersRef} style={{ marginBottom: 100 }}>
          <SectionHeader title="Our Story" sub="Chapters" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { num: "Chapter 01", icon: "✦", title: "How We Met", text: proposal.howWeMet || "The universe conspired — an ordinary day became extraordinary." },
              { num: "Chapter 02", icon: "♥", title: "Why I Love You", text: proposal.whyILoveYou || "Your laugh, your quirks — every imperfect perfect piece of you." },
              { num: "Chapter 03", icon: "✧", title: "Our Future", text: proposal.futureDreams || "Morning coffee, quiet nights, a thousand days — only with you." },
            ].map((ch, idx) => (
              <TiltCard key={ch.title}>
                <div className="chapter-card" style={{
                  background: `linear-gradient(135deg, rgba(138,43,226,0.08), rgba(0,229,255,0.03))`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${idx === 1 ? C.borderC : C.borderP}`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle at top right, ${idx === 1 ? 'rgba(0,229,255,0.1)' : 'rgba(138,43,226,0.1)'}, transparent 70%)`,
                  }} />
                  <div style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: "rgba(0,229,255,0.4)",
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}>{ch.num}</div>
                  <div style={{ fontSize: 32, marginBottom: 16, filter: "drop-shadow(0 0 10px currentColor)" }}>{ch.icon}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: C.gold, marginBottom: 12, fontWeight: 400 }}>{ch.title}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, fontWeight: 300, margin: 0 }}>{ch.text}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ══ GALLERY ══ */}
        {gallery.length > 0 && (
          <section ref={galleryRef} style={{ marginBottom: 100 }}>
            <SectionHeader title="Our Memories" sub="Archive" />
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: 16,
              gridAutoRows: 280,
            }}>
              {gallery.map((item: PhotoItem, idx: number) => (
                <div 
                  key={item.id} 
                  className="gallery-item"
                  style={{ 
                    gridColumn: idx === 0 ? "span 2" : undefined,
                    gridRow: idx === 0 ? "span 2" : undefined,
                    borderRadius: 12, 
                    overflow: "hidden", 
                    border: `1px solid ${C.borderP}`,
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(138,43,226,0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img 
                    src={item.image} 
                    alt="Memory" 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      transition: "transform 0.5s",
                    }} 
                  />
                  {item.caption && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(transparent 40%, rgba(3,1,8,0.9))",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 20,
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }} className="gallery-caption">
                      <span style={{ fontSize: 14, fontStyle: "italic", color: "rgba(240,240,255,0.9)" }}>{item.caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ FINAL QUESTION ══ */}
        <div 
          ref={questionRef}
          style={{ 
            position: "relative", 
            padding: "80px 60px", 
            textAlign: "center", 
            border: `1px solid ${C.borderP}`, 
            borderRadius: 24, 
            background: `linear-gradient(135deg, rgba(138,43,226,0.05), rgba(0,229,255,0.03))`,
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            marginBottom: 80,
          }}
        >
          {/* Animated Background Glow */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: `radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)`,
            animation: "pulse 4s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* Corner Decorations */}
          {[
            { top: 24, left: 24, borderTop: `2px solid ${C.cyan}`, borderLeft: `2px solid ${C.cyan}` },
            { top: 24, right: 24, borderTop: `2px solid ${C.cyan}`, borderRight: `2px solid ${C.cyan}` },
            { bottom: 24, left: 24, borderBottom: `2px solid ${C.gold}`, borderLeft: `2px solid ${C.gold}` },
            { bottom: 24, right: 24, borderBottom: `2px solid ${C.gold}`, borderRight: `2px solid ${C.gold}` },
          ].map((style, i) => (
            <div key={i} style={{ position: "absolute", width: 48, height: 48, ...style, opacity: 0.5 }} />
          ))}

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Animated Heart */}
            <div style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              margin: "0 auto 32px",
              background: `linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,110,180,0.2))`,
              border: `2px solid ${C.purple}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              animation: "heartbeat 2s ease-in-out infinite",
              boxShadow: `0 0 40px rgba(138,43,226,0.3)`,
            }}>
              ♥
            </div>

            <h2 style={{
              fontFamily: "'Cinzel',serif",
              fontSize: "clamp(32px,6vw,56px)",
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: 16,
              color: C.text,
            }}>
              Will you be my{" "}
              <em style={{ 
                color: C.cyan, 
                fontStyle: "italic", 
                fontFamily: "'Cormorant Garamond',serif", 
                fontWeight: 300,
                textShadow: `0 0 30px rgba(0,229,255,0.5)`,
              }}>forever</em>?
            </h2>

            <p style={{
              fontSize: 17,
              fontWeight: 300,
              fontStyle: "italic",
              color: C.muted,
              marginBottom: 48,
            }}>
              {proposal.boyName} is waiting for your answer, {proposal.girlName}
            </p>

            {!answered ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                <MagneticButton onClick={handleYesClick} variant="primary">
                  Yes, Always ♥
                </MagneticButton>
                <MagneticButton variant="secondary">
                  Still thinking…
                </MagneticButton>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 28,
                  color: C.gold,
                  marginBottom: 16,
                  textShadow: `0 0 30px rgba(255,209,102,0.5)`,
                }}>♥ Quest Complete ♥</div>
                <p style={{ fontSize: 18, fontStyle: "italic", color: C.muted }}>
                  You just made someone the happiest person in the universe.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer style={{ 
          paddingTop: 40, 
          borderTop: `1px solid rgba(138,43,226,0.15)`, 
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 10,
            letterSpacing: 3,
            color: "rgba(255,209,102,0.3)",
            textTransform: "uppercase",
          }}>
            Made with <span style={{ color: C.purple, animation: "heartbeat 2s infinite", display: "inline-block" }}>♥</span> for {proposal.girlName}
          </p>
          <p style={{
            fontSize: 12,
            color: "rgba(240,240,255,0.2)",
            marginTop: 12,
            fontStyle: "italic",
          }}>
            &ldquo;In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.&rdquo;
          </p>
        </footer>

      </div>
    </div>
  );
}
