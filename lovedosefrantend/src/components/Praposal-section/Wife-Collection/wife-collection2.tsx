"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type ComponentType } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { type ManagedProposal } from "@/lib/managed-proposals";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { loadProposal, loadPublishedProposal, type PhotoItem, type ProposalData } from "@/lib/proposal-storage";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";
import { DEFAULT_TEMPLATE_RENDERER, resolveTemplateRendererKey } from "@/lib/template-renderers";

// ── Types ─────────────────────────────────────────────────────────────────────
const emptyState: ProposalData = {
  boyName: "", girlName: "", message: "", relationshipType: "Wife", templateId: "",
  howWeMet: "", firstMeetingDate: "", nickname: "", whyILoveYou: "", futureDreams: "",
  heroImage: "", heroImageCaption: "", gallery: [], voiceNote: "",
  publishDurationId: "", publishDurationLabel: "", publishHours: 0, publishPrice: 0,
  allTemplateAccess: false, purchasedTemplateIds: [], publishExpiresAt: "",
  customerDetails: { fullName: "", email: "", phone: "", occasion: "", notes: "", password: "" },
};

// ── ATTRACTIVE MODERN THEME ───────────────────────────────────────────────────
// Premium gradient-rich color palette
const THEMES = {
  sunset: {
    // Warm sunset gradient theme
    bg: ["#0f0c29", "#302b63", "#24243e"],
    surface: "#1a1a2e",
    surfaceLight: "#16213e",
    primary: "#ff6b6b", // Coral
    primaryGradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
    secondary: "#48dbfb", // Sky blue
    secondaryGradient: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)",
    accent: "#ff9ff3", // Pink
    accentGradient: "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)",
    gold: "#feca57",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    glass: "rgba(255, 255, 255, 0.05)",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    shadow: "rgba(0, 0, 0, 0.3)",
    glow: "rgba(255, 107, 107, 0.3)",
    primaryGlow: "rgba(255, 107, 107, 0.45)",
  },
  ocean: {
    // Deep ocean theme
    bg: ["#0c3483", "#0d47a1", "#1565c0"],
    surface: "#0a192f",
    surfaceLight: "#112240",
    primary: "#64ffda", // Teal
    primaryGradient: "linear-gradient(135deg, #64ffda 0%, #00b894 100%)",
    secondary: "#bd34fe", // Purple
    secondaryGradient: "linear-gradient(135deg, #bd34fe 0%, #8b5cf6 100%)",
    accent: "#ff006e", // Hot pink
    accentGradient: "linear-gradient(135deg, #ff006e 0%, #ff4d6d 100%)",
    gold: "#ffd700",
    text: "#e6f1ff",
    textMuted: "#8892b0",
    glass: "rgba(100, 255, 218, 0.05)",
    glassBorder: "rgba(100, 255, 218, 0.1)",
    shadow: "rgba(2, 12, 27, 0.7)",
    glow: "rgba(100, 255, 218, 0.2)",
    primaryGlow: "rgba(100, 255, 218, 0.35)",
  },
  midnight: {
    // Luxury midnight purple
    bg: ["#1a1a2e", "#16213e", "#0f3460"],
    surface: "#1a1a2e",
    surfaceLight: "#252540",
    primary: "#e94560", // Rose
    primaryGradient: "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)",
    secondary: "#533483", // Purple
    secondaryGradient: "linear-gradient(135deg, #533483 0%, #7b2cbf 100%)",
    accent: "#00d9ff", // Cyan
    accentGradient: "linear-gradient(135deg, #00d9ff 0%, #00b4d8 100%)",
    gold: "#ffd700",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    glass: "rgba(233, 69, 96, 0.05)",
    glassBorder: "rgba(233, 69, 96, 0.1)",
    shadow: "rgba(0, 0, 0, 0.5)",
    glow: "rgba(233, 69, 96, 0.3)",
    primaryGlow: "rgba(233, 69, 96, 0.45)",
  },
} as const;

type Family = keyof typeof THEMES;
type Theme = (typeof THEMES)[Family];

// ── Animated Background Particles ─────────────────────────────────────────────
function ParticleBackground({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = [theme.primary, theme.secondary, theme.accent, theme.gold];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(15, 12, 41, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw connections
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.2;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 50%, ${theme.bg[2]} 100%)`,
      }}
    />
  );
}

// ── Floating Hearts Animation ──────────────────────────────────────────────────
function FloatingHearts({ theme }: { theme: Theme }) {
  const hearts = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 10,
      size: 20 + Math.random() * 30,
      emoji: ["💕", "💖", "💗", "💓", "💝"][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          style={{
            position: "absolute",
            left: `${heart.x}%`,
            bottom: -50,
            fontSize: heart.size,
          }}
          animate={{
            y: [0, -window.innerHeight - 200],
            x: [0, Math.sin(heart.id) * 50, 0],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {heart.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ── Text Scramble Effect ───────────────────────────────────────────────────────
function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}

// ── Magnetic Button Component ──────────────────────────────────────────────────
function MagneticButton({ children, onClick, theme }: { children: React.ReactNode; onClick?: () => void; theme: Theme }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// ── 3D Tilt Card ──────────────────────────────────────────────────────────────
function TiltCard({ children, theme }: { children: React.ReactNode; theme: Theme }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Love Timer ────────────────────────────────────────────────────────────────
function useLoveTimer(d: string) {
  const [t, setT] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    if (!d) return;
    const calc = () => {
      const diff = Date.now() - new Date(d).getTime();
      if (diff < 0) return;
      const td = Math.floor(diff / 86400000);
      setT({
        years: Math.floor(td / 365),
        months: Math.floor((td % 365) / 30),
        days: td % 30,
        hours: Math.floor((diff % 86400e3) / 3.6e6),
        minutes: Math.floor((diff % 3.6e6) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [d]);
  
  return t;
}

// ── Scroll Reveal ─────────────────────────────────────────────────────────────
function Rev({ children, delay = 0, direction = "up" }: { 
  children: React.ReactNode; 
  delay?: number; 
  direction?: "up" | "down" | "left" | "right" | "scale" 
}) {
  const directions = {
    up: { y: 60, x: 0, scale: 1 },
    down: { y: -60, x: 0, scale: 1 },
    left: { y: 0, x: -60, scale: 1 },
    right: { y: 0, x: 60, scale: 1 },
    scale: { y: 0, x: 0, scale: 0.8 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Game 1: Neon Memory Match ─────────────────────────────────────────────────
function NeonMemory({ theme }: { theme: Theme }) {
  const [cards, setCards] = useState<Array<{id: number; emoji: string; matched: boolean}>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const emojis = ["💕", "💖", "💗", "💓", "💝", "💞", "💟", "❣️"];
  
  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, matched: false }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || cards[index].matched) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((c, i) => 
          i === first || i === second ? { ...c, matched: true } : c
        ));
        setFlipped([]);
        if (cards.filter(c => c.matched).length + 2 === cards.length) {
          setGameWon(true);
          confetti({ colors: [theme.primary, theme.secondary, theme.gold] });
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const resetGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, matched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setGameWon(false);
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 0 40px ${theme.glow}`,
    }}>
      <h3 style={{ 
        background: theme.primaryGradient, 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        marginBottom: "1.5rem", 
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 700,
      }}>
        💕 MEMORY MATCH
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || card.matched;
          return (
            <motion.button
              key={index}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: isFlipped ? 1 : 1.1, rotate: isFlipped ? 0 : 5 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                rotateY: isFlipped ? 180 : 0,
                boxShadow: card.matched ? `0 0 20px ${theme.primary}` : "none",
              }}
              transition={{ duration: 0.4 }}
              style={{
                aspectRatio: "1",
                borderRadius: 16,
                border: `2px solid ${card.matched ? theme.primary : theme.glassBorder}`,
                background: isFlipped ? theme.primaryGradient : theme.surfaceLight,
                cursor: isFlipped ? "default" : "pointer",
                fontSize: "2rem",
                transformStyle: "preserve-3d",
                position: "relative",
              }}
            >
              <span style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}>
                {card.emoji}
              </span>
              {!isFlipped && (
                <span style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: theme.primary,
                }}>
                  ?
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme.textMuted }}>
        <span>Moves: <strong style={{ color: theme.primary }}>{moves}</strong></span>
        {gameWon && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ color: theme.gold, fontWeight: 700 }}
          >
            ✨ PERFECT!
          </motion.span>
        )}
        <button
          onClick={resetGame}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 20,
            border: `1px solid ${theme.primary}`,
            background: "transparent",
            color: theme.primary,
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Game 2: Love Quiz Pro ─────────────────────────────────────────────────────
function LoveQuizPro({ theme, proposal }: { theme: Theme; proposal: ProposalData }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = [
    {
      q: `When did ${proposal.boyName} first realize he loved ${proposal.girlName}?`,
      options: ["First sight", "First date", "First kiss", "Every moment"],
      correct: 3,
    },
    {
      q: `What is ${proposal.girlName}'s superpower?`,
      options: ["Smile", "Laugh", "Love", "Everything"],
      correct: 3,
    },
    {
      q: "How long will this love last?",
      options: ["1 year", "10 years", "Lifetime", "Forever & beyond"],
      correct: 3,
    },
    {
      q: `Who is ${proposal.boyName}'s favorite person?`,
      options: ["Family", "Friends", "Himself", proposal.girlName],
      correct: 3,
    },
  ];

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === questions[currentQ].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
        if (score + (idx === questions[currentQ].correct ? 1 : 0) === questions.length) {
          confetti({ colors: [theme.gold, theme.primary, theme.secondary] });
        }
      }
    }, 800);
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 0 40px ${theme.secondary}30`,
    }}>
      <h3 style={{ 
        background: theme.secondaryGradient, 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        marginBottom: "1.5rem", 
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 700,
      }}>
        💭 LOVE QUIZ
      </h3>
      
      {!showResult ? (
        <>
          <div style={{ height: 4, background: theme.surfaceLight, borderRadius: 2, marginBottom: "1.5rem", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              style={{ height: "100%", background: theme.secondaryGradient }}
            />
          </div>
          
          <motion.h4 
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: theme.text, marginBottom: "1.25rem", fontSize: "1.1rem" }}
          >
            {questions[currentQ].q}
          </motion.h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {questions[currentQ].options.map((opt, idx) => (
              <motion.button
                key={idx}
                onClick={() => !selected && handleAnswer(idx)}
                disabled={selected !== null}
                whileHover={{ scale: selected === null ? 1.02 : 1, x: selected === null ? 10 : 0 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  borderColor: selected === null ? theme.glassBorder : selected === idx ? (idx === questions[currentQ].correct ? "#00b894" : "#ff7675") : theme.glassBorder,
                  background: selected === null ? theme.surfaceLight : selected === idx ? (idx === questions[currentQ].correct ? "rgba(0, 184, 148, 0.2)" : "rgba(255, 118, 117, 0.2)") : theme.surfaceLight,
                }}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: 12,
                  border: `2px solid ${theme.glassBorder}`,
                  color: theme.text,
                  cursor: selected === null ? "pointer" : "default",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {opt}
                {selected === idx && (
                  <span style={{ fontSize: "1.2rem" }}>
                    {idx === questions[currentQ].correct ? "✓" : "✗"}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          
          <p style={{ textAlign: "center", marginTop: "1rem", color: theme.textMuted, fontSize: "0.85rem" }}>
            Question {currentQ + 1} of {questions.length}
          </p>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", padding: "1rem" }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2 }}
            style={{ fontSize: "4rem", marginBottom: "1rem" }}
          >
            {score === questions.length ? "👑" : score > 2 ? "🌟" : "💝"}
          </motion.div>
          <h4 style={{ color: theme.text, marginBottom: "0.5rem", fontSize: "1.5rem" }}>
            Score: {score}/{questions.length}
          </h4>
          <p style={{ color: theme.textMuted, marginBottom: "1.5rem" }}>
            {score === questions.length ? "Perfect! You're a true love expert!" : "Love is about learning!"}
          </p>
          <button
            onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); setSelected(null); }}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: 24,
              border: "none",
              background: theme.secondaryGradient,
              color: theme.bg[0],
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Game 3: Heart Catcher Ultra ────────────────────────────────────────────────
function HeartCatcherUltra({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (!gameActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    let raf: number;
    let hearts: Array<{x: number; y: number; speed: number; size: number; emoji: string; rotation: number}> = [];
    let catcher = { x: canvas.width / 2, width: 120 };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      catcher.x = e.clientX - rect.left;
    };
    
    canvas.addEventListener("mousemove", handleMouseMove);
    
    const spawnHeart = () => {
      const emojis = ["💕", "💖", "💗", "💓", "💝", "💞"];
      hearts.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -40,
        speed: 3 + Math.random() * 4,
        size: 30,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        rotation: Math.random() * 360,
      });
    };

    let frame = 0;
    const draw = () => {
      // Gradient clear
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `${theme.bg[0]}40`);
      gradient.addColorStop(1, `${theme.bg[1]}40`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw catcher with glow
      const catcherGradient = ctx.createLinearGradient(catcher.x - catcher.width/2, 0, catcher.x + catcher.width/2, 0);
      catcherGradient.addColorStop(0, theme.primary);
      catcherGradient.addColorStop(0.5, theme.secondary);
      catcherGradient.addColorStop(1, theme.primary);
      ctx.fillStyle = catcherGradient;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(catcher.x - catcher.width/2, canvas.height - 25, catcher.width, 15, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update and draw hearts
      hearts = hearts.filter((h) => {
        h.y += h.speed;
        h.rotation += 2;
        
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate((h.rotation * Math.PI) / 180);
        ctx.font = `${h.size}px Arial`;
        ctx.fillText(h.emoji, -h.size/2, h.size/2);
        ctx.restore();
        
        if (h.y > canvas.height - 40 && h.y < canvas.height - 10 && h.x > catcher.x - catcher.width/2 && h.x < catcher.x + catcher.width/2) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          return false;
        }
        return h.y < canvas.height + 50;
      });

      if (frame % 35 === 0) spawnHeart();
      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setGameActive(false); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gameActive, theme, highScore]);

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 0 40px ${theme.accent}30`,
    }}>
      <h3 style={{ 
        background: theme.accentGradient, 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        marginBottom: "1.5rem", 
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 700,
      }}>
        💕 HEART CATCHER
      </h3>
      
      {!gameActive ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: "4rem", marginBottom: "1rem" }}
          >
            🎮
          </motion.div>
          {timeLeft === 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginBottom: "1rem" }}>
              <p style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 700 }}>Score: {score}</p>
              <p style={{ color: theme.textMuted, fontSize: "0.9rem" }}>High Score: {Math.max(score, highScore)}</p>
            </motion.div>
          )}
          <button
            onClick={() => { setScore(0); setTimeLeft(30); setGameActive(true); }}
            style={{
              padding: "1rem 2rem",
              borderRadius: 24,
              border: "none",
              background: theme.accentGradient,
              color: theme.bg[0],
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: `0 10px 30px ${theme.accent}40`,
            }}
          >
            {timeLeft === 30 ? "START GAME" : "PLAY AGAIN"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: theme.surfaceLight,
            borderRadius: 12,
          }}>
            <span style={{ color: theme.text, fontWeight: 600 }}>Score: <span style={{ color: theme.primary }}>{score}</span></span>
            <span style={{ color: theme.accent, fontWeight: 700 }}>Time: {timeLeft}s</span>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 16,
              background: `linear-gradient(180deg, ${theme.bg[0]}80, ${theme.bg[1]}80)`,
              cursor: "none",
              border: `2px solid ${theme.glassBorder}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Game 4: Love Puzzle Slider ─────────────────────────────────────────────────
function LovePuzzleSlider({ theme }: { theme: Theme }) {
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    // Shuffle
    const shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 0].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
  }, []);

  const handleTileClick = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 3, emptyIndex + 3];
    
    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      
      if (newTiles.every((t, i) => t === (i + 1) % 9)) {
        setSolved(true);
        confetti({ colors: [theme.gold, theme.primary, theme.secondary, theme.accent] });
      }
    }
  };

  const reset = () => {
    const shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 0].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setMoves(0);
    setSolved(false);
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 0 40px ${theme.gold}30`,
    }}>
      <h3 style={{ 
        background: `linear-gradient(135deg, ${theme.gold}, #f39c12)`, 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        marginBottom: "1.5rem", 
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 700,
      }}>
        🧩 LOVE PUZZLE
      </h3>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "0.5rem",
        marginBottom: "1rem",
        padding: "0.5rem",
        background: theme.bg[1],
        borderRadius: 16,
      }}>
        {tiles.map((tile, index) => (
          <motion.button
            key={tile}
            onClick={() => handleTileClick(index)}
            whileHover={{ scale: tile !== 0 ? 1.05 : 1 }}
            whileTap={{ scale: tile !== 0 ? 0.95 : 1 }}
            animate={solved ? { 
              scale: [1, 1.1, 1], 
              rotate: [0, 5, -5, 0],
              boxShadow: `0 0 30px ${theme.gold}`,
            } : {}}
            transition={{ duration: 0.2 }}
            style={{
              aspectRatio: "1",
              borderRadius: 12,
              border: "none",
              background: tile === 0 ? "transparent" : theme.primaryGradient,
              color: theme.bg[0],
              fontSize: "1.5rem",
              fontWeight: 700,
              cursor: tile !== 0 ? "pointer" : "default",
              boxShadow: tile !== 0 ? `0 4px 15px ${theme.primary}40` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {tile !== 0 && tile}
          </motion.button>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme.textMuted }}>
        <span>Moves: <strong style={{ color: theme.primary }}>{moves}</strong></span>
        {solved && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ color: theme.gold, fontWeight: 700 }}
          >
            ✨ SOLVED!
          </motion.span>
        )}
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 20,
            border: `1px solid ${theme.gold}`,
            background: "transparent",
            color: theme.gold,
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}

// ── Voice Player ──────────────────────────────────────────────────────────────
function VoicePlayer({ src, theme }: { src: string; theme: Theme }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    const handleLoaded = () => setDuration(audio.duration);
    
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", () => setPlaying(false));
    
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

  const toggle = async () => {
    const audio = ref.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      await audio.play();
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 20,
      padding: "1.5rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 10px 40px ${theme.shadow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: theme.primaryGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 0 30px ${theme.primaryGlow}`,
          }}
        >
          <span style={{ color: theme.bg[0], fontSize: "1.5rem" }}>
            {playing ? "⏸" : "▶"}
          </span>
        </motion.div>
        <div style={{ flex: 1 }}>
          <p style={{ color: theme.text, fontWeight: 600, marginBottom: "0.25rem", fontSize: "1.1rem" }}>
            🎙️ Voice Message
          </p>
          <p style={{ color: theme.textMuted, fontSize: "0.9rem" }}>
            {playing ? "Playing..." : duration ? formatTime(duration) : "Tap to listen"}
          </p>
        </div>
      </div>
      
      <div style={{ height: 6, background: theme.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          style={{
            height: "100%",
            background: theme.primaryGradient,
            width: `${progress}%`,
          }}
        />
      </div>
      
      <audio ref={ref} src={src} style={{ display: "none" }} />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ProposalExperience() {
  const searchParams = useSearchParams();
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [managedProposal, setManagedProposal] = useState<ManagedProposal | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: number; x: number; y: number}>>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Load data
  useEffect(() => {
    let cancelled = false;
    const managedSlug = searchParams.get("managed");
    const previewMode = searchParams.get("preview") === "1";
    
    Promise.all([
      managedSlug
        ? fetch(`/api/proposals/${encodeURIComponent(managedSlug)}`)
            .then((r) => r.ok ? r.json() : { proposal: null })
        : previewMode ? loadProposal() : loadPublishedProposal(),
      fetch("/api/templates").then((r) => r.json()),
    ]).then(([data, templateRes]) => {
      if (!cancelled && managedSlug && data?.proposal) {
        setManagedProposal(data.proposal);
        setProposal(data.proposal.proposal);
      }
      if (!cancelled && !managedSlug && data) setProposal(data as ProposalData);
      if (!cancelled) setTemplates(templateRes.templates ?? []);
      if (!cancelled) setLoaded(true);
    });
    
    return () => { cancelled = true; };
  }, [searchParams]);

  const hasProposal = useMemo(() => Boolean(proposal.boyName && proposal.girlName && proposal.message), [proposal]);
  const gallery = useMemo(() => proposal.gallery.filter((g) => g.image.trim()), [proposal.gallery]);
  const timer = useLoveTimer(proposal.firstMeetingDate);
  
  const hasPublishingSetup = Boolean(
    proposal.publishDurationId &&
    proposal.customerDetails.fullName &&
    proposal.customerDetails.email &&
    proposal.customerDetails.phone &&
    proposal.customerDetails.password
  );
  
  const isPreviewMode = searchParams.get("preview") === "1";
  const previewTemplateId = searchParams.get("templateId") ?? "";

  const tpl = templates.find(
    (t) => t.id === (isPreviewMode && previewTemplateId ? previewTemplateId : managedProposal?.templateId || proposal.templateId)
  ) ?? null;
  
  const requestedFamily = managedProposal?.themeFamily || tpl?.family;
  const family: Family = requestedFamily && requestedFamily in THEMES
    ? (requestedFamily as Family)
    : "sunset";
  const theme = THEMES[family] ?? THEMES.sunset;

  const handleAccept = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700);
    setTimeout(() => setAccepted(true), 300);
    
    await confetti({
      particleCount: 300,
      spread: 180,
      startVelocity: 70,
      origin: { y: 0.6 },
      colors: [theme.primary, theme.secondary, theme.accent, theme.gold],
    });
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg[0], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            border: `4px solid ${theme.primary}`, 
            borderTopColor: "transparent",
            borderBottomColor: theme.secondary,
          }}
        />
      </div>
    );
  }

  if (!hasProposal) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg[0], display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 440, textAlign: "center", padding: "3rem", borderRadius: 28, background: theme.surface, border: `1px solid ${theme.glassBorder}`, boxShadow: `0 0 60px ${theme.glow}` }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>💔</motion.div>
          <h1 style={{ color: theme.text, marginBottom: "1rem", fontSize: "2rem" }}>No Proposal Found</h1>
          <Link href="/" style={{ padding: "14px 32px", borderRadius: 24, background: theme.primaryGradient, color: theme.bg[0], textDecoration: "none", fontWeight: 600 }}>Create Proposal</Link>
        </div>
      </div>
    );
  }

  if (!hasPublishingSetup && !isPreviewMode) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg[0], display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: "3rem", borderRadius: 28, background: theme.surface, border: `1px solid ${theme.glassBorder}` }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>⏳</motion.div>
          <h1 style={{ color: theme.text, marginBottom: "1rem" }}>Almost Ready</h1>
          <Link href="/publish-plan" style={{ padding: "14px 32px", borderRadius: 24, background: theme.secondaryGradient, color: theme.bg[0], textDecoration: "none", fontWeight: 600 }}>Complete Setup</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 50%, ${theme.bg[2]} 100%)`, color: theme.text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${theme.bg[0]}; }
        ::-webkit-scrollbar-thumb { background: ${theme.primaryGradient}; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
      `}</style>

      <ParticleBackground theme={theme} />
      <FloatingHearts theme={theme} />

      {/* Spotlight Effect */}
      <div style={{
        position: "fixed",
        left: mousePos.x - 300,
        top: mousePos.y - 300,
        width: 600,
        height: 600,
        background: `radial-gradient(circle, ${theme.primary}10 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 1,
        transition: "left 0.1s, top 0.1s",
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Navigation */}
        <nav style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "1.5rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `${theme.bg[0]}90`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.glassBorder}`,
        }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, background: theme.primaryGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <ScrambleText text="ETERNAL" />
            </span>
          </motion.div>
          
          <MagneticButton theme={theme}>
            <Link href="/dashboard" style={{ color: theme.text, textDecoration: "none", padding: "12px 24px", borderRadius: 20, border: `1px solid ${theme.glassBorder}`, background: theme.glass }}>
              Change Style
            </Link>
          </MagneticButton>
        </nav>

        {/* Hero Section */}
        <section ref={heroRef} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "8rem 2rem 4rem", position: "relative" }}>
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
            <div style={{ width: "100%", height: "100%", background: `radial-gradient(circle at 50% 50%, ${theme.primary}20, transparent)` }} />
          </motion.div>

          <div style={{ maxWidth: 1400, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px", background: theme.glass, borderRadius: 30, border: `1px solid ${theme.primary}`, marginBottom: 32 }}>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: "50%", background: theme.primary }} />
                <span style={{ fontSize: 14, color: theme.primary, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>Interactive Experience</span>
              </motion.div>

              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(4rem, 8vw, 7rem)", fontWeight: 800, lineHeight: 1, marginBottom: 24 }}>
                <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: "block", color: theme.text }}>
                  HEY
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "block", background: theme.primaryGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: `0 0 60px ${theme.primaryGlow}` }}>
                  {proposal.girlName}
                </motion.span>
              </h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ fontSize: 20, color: theme.textMuted, lineHeight: 1.8, marginBottom: 40, maxWidth: 500 }}>
                {proposal.message}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: theme.primaryGradient, display: "flex", alignItems: "center", justifyContent: "center", color: theme.bg[0], fontSize: 28, fontWeight: 700, boxShadow: `0 0 40px ${theme.primaryGlow}` }}>
                  {proposal.boyName.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>From your loving husband</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>{proposal.boyName}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
              <TiltCard theme={theme}>
                <div style={{
                  background: theme.surface,
                  borderRadius: 32,
                  padding: "2rem",
                  border: `1px solid ${theme.glassBorder}`,
                  boxShadow: `0 0 80px ${theme.glow}`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: theme.primaryGradient }} />
                  <div style={{ textAlign: "center" }}>
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ fontSize: "6rem", marginBottom: "1rem" }}>💗</motion.div>
                    <h3 style={{ fontSize: 28, marginBottom: 24, color: theme.text }}>Our Love Timer</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                      {[
                        { val: timer.years, label: "Years" },
                        { val: timer.months, label: "Months" },
                        { val: timer.days, label: "Days" },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center", padding: "1rem", background: theme.surfaceLight, borderRadius: 16 }}>
                          <div style={{ fontSize: 36, fontWeight: 800, background: theme.primaryGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{String(item.val).padStart(2, "0")}</div>
                          <div style={{ fontSize: 12, color: theme.textMuted, textTransform: "uppercase" }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                      {[
                        { val: timer.hours, label: "Hours" },
                        { val: timer.minutes, label: "Minutes" },
                        { val: timer.seconds, label: "Seconds" },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: theme.secondary }}>{String(item.val).padStart(2, "0")}</div>
                          <div style={{ fontSize: 10, color: theme.textMuted }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section style={{ padding: "6rem 2rem", maxWidth: 1400, margin: "0 auto" }}>
          <Rev>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span style={{ color: theme.primary, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 600 }}>Our Journey</span>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginTop: 16, fontWeight: 800 }}>CHAPTERS OF US</h2>
            </div>
          </Rev>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { icon: "🌟", title: "How We Met", content: proposal.howWeMet || "Destiny brought us together", gradient: theme.primaryGradient },
              { icon: "💝", title: "Why I Love You", content: proposal.whyILoveYou || "You make every moment magical", gradient: theme.secondaryGradient },
              { icon: "🔮", title: "Our Future", content: proposal.futureDreams || "Forever is just the beginning", gradient: theme.accentGradient },
            ].map((chapter, i) => (
              <Rev key={i} delay={i * 0.1}>
                <TiltCard theme={theme}>
                  <div style={{
                    background: theme.surface,
                    borderRadius: 24,
                    padding: "2.5rem",
                    border: `1px solid ${theme.glassBorder}`,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: chapter.gradient }} />
                    <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }} style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>{chapter.icon}</motion.div>
                    <h3 style={{ fontSize: 24, marginBottom: 16, color: theme.text, fontWeight: 700 }}>{chapter.title}</h3>
                    <p style={{ color: theme.textMuted, lineHeight: 1.7, fontSize: 16 }}>{chapter.content}</p>
                  </div>
                </TiltCard>
              </Rev>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <section style={{ padding: "6rem 2rem", background: theme.surface }}>
            <div style={{ maxWidth: 1400, margin: "0 auto" }}>
              <Rev>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                  <span style={{ color: theme.secondary, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 600 }}>Memories</span>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginTop: 16, fontWeight: 800 }}>MOMENTS IN TIME</h2>
                </div>
              </Rev>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {gallery.map((item, idx) => (
                  <Rev key={item.id} delay={idx * 0.1}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        position: "relative",
                        aspectRatio: "4/5",
                        boxShadow: `0 20px 40px ${theme.shadow}`,
                      }}
                    >
                      <img src={item.image} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.8))",
                          display: "flex",
                          alignItems: "flex-end",
                          padding: 24,
                        }}
                      >
                        <p style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}>{item.caption}</p>
                      </motion.div>
                    </motion.div>
                  </Rev>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Voice Note */}
        {proposal.voiceNote && (
          <section style={{ padding: "0 2rem 6rem", maxWidth: 700, margin: "0 auto" }}>
            <Rev>
              <VoicePlayer src={proposal.voiceNote} theme={theme} />
            </Rev>
          </section>
        )}

        {/* Games Section */}
        <section style={{ padding: "6rem 2rem", maxWidth: 1400, margin: "0 auto" }}>
          <Rev>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span style={{ color: theme.gold, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 600 }}>Play Together</span>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginTop: 16, fontWeight: 800 }}>GAMES OF LOVE</h2>
            </div>
          </Rev>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            <Rev delay={0.1}><NeonMemory theme={theme} /></Rev>
            <Rev delay={0.2}><LoveQuizPro theme={theme} proposal={proposal} /></Rev>
            <Rev delay={0.3}><HeartCatcherUltra theme={theme} /></Rev>
            <Rev delay={0.4}><LovePuzzleSlider theme={theme} /></Rev>
          </div>
        </section>

        {/* Final Question */}
        <section style={{ padding: "8rem 2rem", display: "flex", justifyContent: "center" }}>
          <Rev>
            <div style={{
              maxWidth: 900,
              width: "100%",
              background: theme.surface,
              borderRadius: 40,
              padding: "4rem",
              border: `2px solid ${theme.primary}50`,
              boxShadow: `0 0 100px ${theme.glow}`,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent}, ${theme.gold})` }} />
              
              <AnimatePresence mode="wait">
                {!accepted ? (
                  <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ fontSize: "7rem", marginBottom: "2rem", filter: `drop-shadow(0 0 30px ${theme.primary})` }}
                    >
                      💍
                    </motion.div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: 24, fontWeight: 800 }}>
                      Will you be mine forever,<br />
                      <span style={{ background: theme.primaryGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        my love {proposal.girlName}?
                      </span>
                    </h2>
                    <p style={{ color: theme.textMuted, marginBottom: 40, fontSize: 18 }}>Click the heart if your answer is yes ????</p>
                    <motion.button
                      onClick={handleAccept}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        padding: "16px 40px",
                        fontSize: 18,

                        fontWeight: 700,
                        color: theme.bg[0],
                        background: theme.primaryGradient,
                        border: "none",
                        borderRadius: 30,
                        cursor: "pointer",
                        boxShadow: `0 0 40px ${theme.primaryGlow}`,
                      }}
                    >
                      ❤️ YES
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="accepted" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ fontSize: "7rem", marginBottom: "2rem", filter: `drop-shadow(0 0 40px ${theme.gold})` }}
                    > 
                    💖
                    </motion.div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: 24, fontWeight: 800 }}>
                      I love you too, {proposal.boyName}!<br />
                      Forever and always.
                    </h2>
                    <p style={{ color: theme.textMuted, marginBottom: 40, fontSize: 18 }}>Here's to our forever journey together 🥂</p>
                    <motion.button
                      onClick={() => {
                        confetti({
                          particleCount: 500,
                          spread: 360,
                          startVelocity: 80,
                          origin: { y: 0.5 },
                          colors: [theme.primary, theme.secondary, theme.accent, theme.gold],
                        });
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        padding: "16px 40px",
                        fontSize: 18,
                        fontWeight: 700,
                        color: theme.bg[0],
                        background: theme.gold,
                        border: "none",
                        borderRadius: 30,
                        cursor: "pointer",
                        boxShadow: `0 0 40px ${theme.gold}`,
                      }}
                    >
                      🎉 CELEBRATE 
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Ripple Effect */}
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ opacity: 0.5, scale: 0 }}
                    animate={{ opacity: 0, scale: 4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      position: "absolute",
                      left: ripple.x,
                      top: ripple.y,
                      width: 20,
                      height: 20,
                      background: theme.gold,
                      borderRadius: "50%",
                      pointerEvents: "none",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Rev>
        </section>
      </div>
    </div>
  );
}


