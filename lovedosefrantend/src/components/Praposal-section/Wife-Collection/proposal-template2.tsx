"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { type ManagedProposal } from "@/lib/managed-proposals";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { loadProposal, loadPublishedProposal, type PhotoItem, type ProposalData } from "@/lib/proposal-storage";

// ── Types ─────────────────────────────────────────────────────────────────────
const emptyState: ProposalData = {
  boyName: "", girlName: "", message: "", relationshipType: "Wife", templateId: "",
  howWeMet: "", firstMeetingDate: "", nickname: "", whyILoveYou: "", futureDreams: "",
  heroImage: "", heroImageCaption: "", gallery: [], voiceNote: "",
  publishDurationId: "", publishDurationLabel: "", publishHours: 0, publishPrice: 0,
  allTemplateAccess: false, purchasedTemplateIds: [], publishExpiresAt: "",
  customerDetails: { fullName: "", email: "", phone: "", occasion: "", notes: "", password: "" },
};

const loaderCache = new Map<string, Promise<ProposalData | { proposal: ManagedProposal | null } | { templates?: ProposalTemplate[] } | null>>();

function loadCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = loaderCache.get(key) as Promise<T> | undefined;
  if (cached) {
    return cached;
  }

  const request = loader().catch((error) => {
    loaderCache.delete(key);
    throw error;
  });

  loaderCache.set(key, request as Promise<ProposalData | { proposal: ManagedProposal | null } | { templates?: ProposalTemplate[] } | null>);
  return request;
}

// ── LUXURY ETHEREAL THEME ──────────────────────────────────────────────────────
// Based on: Deep charcoal, warm ivory, rose gold accents [^13^][^15^][^17^]
const THEMES = {
  ethereal: {
    // Deep, rich dark mode base (luxury feel)
    bg: ["#0D0D0D", "#141414", "#1A1A1A"],
    surface: "#1E1E1E",
    surfaceLight: "#252525",
    
    // Warm ivory/cream for contrast (elegant, not harsh white)
    ivory: "#F5F0E8",
    ivoryMuted: "#E8E2D9",
    
    // Rose gold - the romantic accent (sophisticated, not childish pink)
    roseGold: "#B76E79",
    roseGoldLight: "#D4A5AD",
    roseGoldDark: "#8B4A52",
    
    // Secondary accents
    champagne: "#C9A87C",
    champagneLight: "#E8D4B8",
    
    // Text hierarchy
    textPrimary: "#F5F0E8",
    textSecondary: "#A8A29E",
    textMuted: "#78716C",
    
    // Effects
    glass: "rgba(30, 30, 30, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    shadow: "rgba(0, 0, 0, 0.4)",
    glow: "rgba(183, 110, 121, 0.15)",
    
    // Gradients
    heroGradient: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #141414 100%)",
    roseGradient: "linear-gradient(135deg, #B76E79 0%, #D4A5AD 100%)",
    champagneGradient: "linear-gradient(135deg, #C9A87C 0%, #E8D4B8 100%)",
    
    symbol: "✦",
    label: "Ethereal",
    questionText: "Will you walk with me into forever",
  },
  midnight: {
    // Deep navy-black luxury
    bg: ["#0A0E1A", "#0F172A", "#1E293B"],
    surface: "#1E293B",
    surfaceLight: "#334155",
    ivory: "#F8FAFC",
    ivoryMuted: "#E2E8F0",
    roseGold: "#94A3B8", // Silver instead of rose
    roseGoldLight: "#CBD5E1",
    roseGoldDark: "#64748B",
    champagne: "#60A5FA", // Soft blue accent
    champagneLight: "#93C5FD",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    glass: "rgba(30, 41, 59, 0.7)",
    glassBorder: "rgba(255, 255, 255, 0.05)",
    shadow: "rgba(0, 0, 0, 0.5)",
    glow: "rgba(96, 165, 250, 0.15)",
    heroGradient: "linear-gradient(135deg, #0A0E1A 0%, #1E293B 100%)",
    roseGradient: "linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)",
    champagneGradient: "linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)",
    symbol: "◆",
    label: "Midnight",
    questionText: "Shall we continue writing our story",
  },
  velvet: {
    // Rich burgundy luxury
    bg: ["#1A0A0F", "#2D1A1F", "#3D2429"],
    surface: "#4A2C32",
    surfaceLight: "#5D3A42",
    ivory: "#FAF5F0",
    ivoryMuted: "#F0E6DC",
    roseGold: "#E8B4B8",
    roseGoldLight: "#F5D0D3",
    roseGoldDark: "#C48A90",
    champagne: "#D4A574",
    champagneLight: "#E8C9A8",
    textPrimary: "#FAF5F0",
    textSecondary: "#D4A5A8",
    textMuted: "#9A7A7E",
    glass: "rgba(74, 44, 50, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.06)",
    shadow: "rgba(0, 0, 0, 0.5)",
    glow: "rgba(232, 180, 184, 0.2)",
    heroGradient: "linear-gradient(135deg, #1A0A0F 0%, #3D2429 100%)",
    roseGradient: "linear-gradient(135deg, #E8B4B8 0%, #F5D0D3 100%)",
    champagneGradient: "linear-gradient(135deg, #D4A574 0%, #E8C9A8 100%)",
    symbol: "❋",
    label: "Velvet",
    questionText: "May I have the honor of your forever",
  },
} as const;

type Family = keyof typeof THEMES;
type Theme = (typeof THEMES)[Family];

// ── Floating Rose Petals ────────────────────────────────────────────────────────
function RosePetalField({ family }: { family: Family }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = THEMES[family];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const petals = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: 8 + Math.random() * 12,
      speedY: 0.8 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      opacity: 0.15 + Math.random() * 0.25,
      swayOffset: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(time + p.swayOffset) * 0.5 + p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 50) {
          p.y = -50;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        
        // Draw rose petal shape
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, theme.roseGold);
        gradient.addColorStop(1, theme.roseGoldDark);
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.5, p.size * 0.5, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.5, -p.size * 0.5, 0, -p.size);
        ctx.fill();
        
        ctx.restore();
      });
      
      raf = requestAnimationFrame(draw);
    };
    
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [family, THEMES]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
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
    scale: { y: 0, x: 0, scale: 0.9 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.9, 
        delay, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for luxury feel
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Game 1: Memory Match ──────────────────────────────────────────────────────
function MemoryGame({ theme }: { theme: Theme }) {
  const [cards, setCards] = useState<Array<{id: number; emoji: string; content: number; isFlipped?: boolean; isMatched?: boolean}>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const emojis = ["💕", "💍", "🌹", "🥂", "🏠", "✨", "🦋", "💌"];
  
  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, content: i % emojis.length }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].content === cards[second].content) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setGameWon(true);
          confetti({ 
            particleCount: 150, 
            spread: 100, 
            colors: [theme.roseGold, theme.champagne, theme.ivory] 
          });
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const resetGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, content: i % emojis.length }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 25px 50px -12px ${theme.shadow}`,
    }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: "1.5rem", 
          color: theme.textPrimary,
          marginBottom: "0.5rem",
          fontWeight: 400,
        }}>
          Memory of Us
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>
          Find the matching pairs
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.75rem",
        marginBottom: "1.5rem",
      }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);
          
          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isMatched ? { scale: [1, 1.1, 1] } : {}}
              style={{
                aspectRatio: "1",
                borderRadius: 16,
                border: `1px solid ${isMatched ? theme.roseGold : theme.glassBorder}`,
                cursor: isFlipped ? "default" : "pointer",
                background: isFlipped 
                  ? isMatched ? `${theme.roseGold}20` : theme.surfaceLight 
                  : theme.bg[1],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                transition: "all 0.3s ease",
                boxShadow: isMatched ? `0 0 20px ${theme.glow}` : "none",
              }}
            >
              {isFlipped ? card.emoji : (
                <span style={{ 
                  fontSize: "1.5rem", 
                  color: theme.textMuted,
                  opacity: 0.5 
                }}>
                  ✦
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "1rem",
        background: theme.bg[1],
        borderRadius: 12,
        border: `1px solid ${theme.glassBorder}`,
      }}>
        <span style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>
          Moves: <strong style={{ color: theme.textPrimary }}>{moves}</strong>
        </span>
        {gameWon && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ color: theme.roseGold, fontWeight: 500 }}
          >
            ✨ Completed!
          </motion.span>
        )}
        <button
          onClick={resetGame}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 20,
            border: `1px solid ${theme.roseGold}`,
            background: "transparent",
            color: theme.roseGold,
            cursor: "pointer",
            fontSize: "0.85rem",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.roseGold;
            e.currentTarget.style.color = theme.bg[0];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = theme.roseGold;
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Game 2: Love Quiz ─────────────────────────────────────────────────────────
function LoveQuiz({ theme, proposal }: { theme: Theme; proposal: ProposalData }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const questions = [
    {
      q: "Where did we first meet?",
      options: ["At a café", "Through friends", "A chance encounter", "Destiny brought us together"],
      correct: 3,
    },
    {
      q: `What is ${proposal.boyName}'s favorite thing about ${proposal.girlName}?`,
      options: ["Her smile", "Her kindness", "Everything about her", "Her laugh"],
      correct: 2,
    },
    {
      q: "What does forever mean to us?",
      options: ["A long time", "Until the end", "Every moment together", "Infinity and beyond"],
      correct: 2,
    },
  ];

  const handleAnswer = (index: number) => {
    setSelected(index);
    const correct = index === questions[currentQ].correct;
    setIsCorrect(correct);
    
    if (correct) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        if (score + (correct ? 1 : 0) === questions.length) {
          confetti({ colors: [theme.roseGold, theme.champagne, theme.ivory] });
        }
      }
    }, 1200);
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 25px 50px -12px ${theme.shadow}`,
    }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: "1.5rem", 
          color: theme.textPrimary,
          fontWeight: 400,
        }}>
          How Well Do You Know Us?
        </h3>
      </div>

      {!showResult ? (
        <div>
          <div style={{
            height: 3,
            background: theme.bg[1],
            borderRadius: 2,
            marginBottom: "1.5rem",
            overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              style={{ height: "100%", background: theme.roseGradient }}
            />
          </div>

          <h4 style={{ 
            color: theme.textPrimary, 
            marginBottom: "1.25rem",
            fontSize: "1.1rem",
            fontWeight: 400,
            lineHeight: 1.5,
          }}>
            {questions[currentQ].q}
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {questions[currentQ].options.map((opt, idx) => {
              const isSelected = selected === idx;
              const showCorrect = isSelected && isCorrect !== null;
              
              return (
                <motion.button
                  key={idx}
                  onClick={() => !selected && handleAnswer(idx)}
                  disabled={selected !== null}
                  whileHover={{ scale: selected === null ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  animate={showCorrect ? { 
                    borderColor: isCorrect ? "#22C55E" : "#EF4444",
                    backgroundColor: isCorrect ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"
                  } : {}}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: 12,
                    border: `1px solid ${isSelected ? theme.roseGold : theme.glassBorder}`,
                    background: isSelected ? `${theme.roseGold}15` : theme.bg[1],
                    cursor: selected === null ? "pointer" : "default",
                    textAlign: "left",
                    color: theme.textPrimary,
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {opt}
                  {showCorrect && (
                    <span style={{ fontSize: "1.2rem" }}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <p style={{ 
            textAlign: "center", 
            marginTop: "1rem", 
            color: theme.textMuted,
            fontSize: "0.85rem" 
          }}>
            Question {currentQ + 1} of {questions.length}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", padding: "1rem" }}
        >
          <div style={{ 
            fontSize: "3.5rem", 
            marginBottom: "1rem",
            color: score === questions.length ? theme.roseGold : theme.textSecondary 
          }}>
            {score === questions.length ? "👑" : score > 0 ? "💝" : "💫"}
          </div>
          <h4 style={{ 
            color: theme.textPrimary, 
            marginBottom: "0.5rem", 
            fontSize: "1.3rem",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
          }}>
            You scored {score}/{questions.length}
          </h4>
          <p style={{ color: theme.textSecondary, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            {score === questions.length 
              ? "Perfect! You know our love by heart." 
              : "Every love story has its beautiful mysteries."}
          </p>
          <button
            onClick={() => {
              setCurrentQ(0);
              setScore(0);
              setShowResult(false);
              setSelected(null);
              setIsCorrect(null);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: 24,
              border: "none",
              background: theme.roseGradient,
              color: theme.bg[0],
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Game 3: Heart Catcher ─────────────────────────────────────────────────────
function HeartCatcher({ theme }: { theme: Theme }) {
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
    let hearts: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];
    let catcher = { x: canvas.width / 2, width: 100, targetX: canvas.width / 2 };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      catcher.targetX = e.clientX - rect.left;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      catcher.targetX = e.touches[0].clientX - rect.left;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    
    const spawnHeart = () => {
      hearts.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -40,
        speed: 2 + Math.random() * 2,
        size: 24,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    };

    let frame = 0;
    const draw = () => {
      // Clear with fade effect
      ctx.fillStyle = `${theme.bg[0]}40`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Smooth catcher movement
      catcher.x += (catcher.targetX - catcher.x) * 0.1;
      catcher.x = Math.max(catcher.width/2, Math.min(canvas.width - catcher.width/2, catcher.x));
      
      // Draw catcher (elegant basket)
      ctx.fillStyle = theme.roseGold;
      ctx.beginPath();
      ctx.moveTo(catcher.x - catcher.width/2, canvas.height - 20);
      ctx.quadraticCurveTo(catcher.x, canvas.height - 40, catcher.x + catcher.width/2, canvas.height - 20);
      ctx.lineTo(catcher.x + catcher.width/2 - 10, canvas.height - 10);
      ctx.lineTo(catcher.x - catcher.width/2 + 10, canvas.height - 10);
      ctx.closePath();
      ctx.fill();
      
      // Glow effect
      ctx.shadowColor = theme.roseGold;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Update and draw hearts
      hearts = hearts.filter((h) => {
        h.y += h.speed;
        h.rotation += h.rotationSpeed;
        
        // Draw heart
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate((h.rotation * Math.PI) / 180);
        ctx.fillStyle = theme.roseGold;
        ctx.font = `${h.size}px serif`;
        ctx.fillText("💕", -h.size/2, h.size/2);
        ctx.restore();
        
        // Check collision
        if (
          h.y > canvas.height - 50 &&
          h.y < canvas.height - 10 &&
          h.x > catcher.x - catcher.width/2 &&
          h.x < catcher.x + catcher.width/2
        ) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          return false;
        }
        
        return h.y < canvas.height + 50;
      });

      if (frame % 45 === 0) spawnHeart();
      frame++;
      
      raf = requestAnimationFrame(draw);
    };
    
    draw();
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameActive, theme, highScore]);

  return (
    <div style={{
      background: theme.surface,
      borderRadius: 24,
      padding: "2rem",
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 25px 50px -12px ${theme.shadow}`,
    }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: "1.5rem", 
          color: theme.textPrimary,
          fontWeight: 400,
        }}>
          Catch My Love
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>
          Move to catch the falling hearts
        </p>
      </div>

      {!gameActive ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          {timeLeft === 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ marginBottom: "1.5rem" }}
            >
              <div style={{ 
                fontSize: "2.5rem", 
                marginBottom: "0.5rem",
                color: theme.roseGold 
              }}>
                ✨
              </div>
              <p style={{ color: theme.textPrimary, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                Final Score: <strong>{score}</strong>
              </p>
              <p style={{ color: theme.textMuted, fontSize: "0.85rem" }}>
                High Score: {Math.max(score, highScore)}
              </p>
            </motion.div>
          )}
          <button
            onClick={() => {
              setScore(0);
              setTimeLeft(30);
              setGameActive(true);
            }}
            style={{
              padding: "1rem 2rem",
              borderRadius: 24,
              border: "none",
              background: theme.roseGradient,
              color: theme.bg[0],
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              boxShadow: `0 10px 30px ${theme.glow}`,
            }}
          >
            {timeLeft === 30 ? "Start Game" : "Play Again"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: theme.bg[1],
            borderRadius: 12,
            border: `1px solid ${theme.glassBorder}`,
          }}>
            <span style={{ color: theme.textPrimary, fontWeight: 500 }}>
              Score: {score}
            </span>
            <span style={{ color: theme.roseGold, fontWeight: 500 }}>
              {timeLeft}s
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={280}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 16,
              background: theme.bg[0],
              border: `1px solid ${theme.glassBorder}`,
              cursor: "none",
            }}
          />
        </div>
      )}
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
      boxShadow: `0 20px 40px ${theme.shadow}`,
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem",
        marginBottom: "1rem" 
      }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: theme.roseGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 8px 25px ${theme.glow}`,
          }}
        >
          <span style={{ color: theme.bg[0], fontSize: "1.25rem", marginLeft: playing ? 0 : 3 }}>
            {playing ? "⏸" : "▶"}
          </span>
        </motion.div>
        <div style={{ flex: 1 }}>
          <p style={{ 
            color: theme.textPrimary, 
            fontWeight: 500,
            marginBottom: "0.25rem",
            fontSize: "1.05rem",
          }}>
            A Message From My Heart
          </p>
          <p style={{ color: theme.textMuted, fontSize: "0.85rem" }}>
            {playing ? "Playing..." : duration ? formatTime(duration) : "Tap to listen"}
          </p>
        </div>
      </div>
      
      <div style={{
        height: 4,
        background: theme.bg[1],
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <motion.div
          style={{
            height: "100%",
            background: theme.roseGradient,
            width: `${progress}%`,
          }}
        />
      </div>
      
      <audio ref={ref} src={src} style={{ display: "none" }} />
    </div>
  );
}

// ── Elegant Card Component ────────────────────────────────────────────────────
function ElegantCard({ 
  children, 
  span = 1, 
  theme, 
  delay = 0,
  accent = false,
  className = "",
}: { 
  children: React.ReactNode; 
  span?: 1 | 2; 
  theme: Theme;
  delay?: number;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Rev delay={delay} direction="up">
      <motion.div
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        style={{
          gridColumn: span === 2 ? "span 2" : "span 1",
          background: accent ? `${theme.roseGold}08` : theme.surface,
          borderRadius: 24,
          padding: "2rem",
          border: `1px solid ${accent ? theme.roseGold : theme.glassBorder}`,
          boxShadow: `0 25px 50px -12px ${theme.shadow}`,
          backdropFilter: "blur(20px)",
          position: "relative",
          overflow: "hidden",
        }}
        className={className}
      >
        {accent && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: theme.roseGradient,
          }} />
        )}
        {children}
      </motion.div>
    </Rev>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ProposalExperience() {
  const searchParams = useSearchParams();
  const managedSlug = searchParams.get("managed");
  const isPreviewMode = searchParams.get("preview") === "1";
  const previewTemplateId = searchParams.get("templateId") ?? "";
  const [proposal, setProposal] = useState<ProposalData>(emptyState);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [managedProposal, setManagedProposal] = useState<ManagedProposal | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: number; x: number; y: number}>>([]);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load data
  useEffect(() => {
    let cancelled = false;
    const proposalKey = managedSlug
      ? `managed:${managedSlug}`
      : isPreviewMode
        ? "preview"
        : "published";
    
    Promise.all([
      loadCached(proposalKey, () => (
        managedSlug
          ? fetch(`/api/proposals/${encodeURIComponent(managedSlug)}`)
              .then((r) => r.ok ? r.json() : { proposal: null })
          : isPreviewMode ? loadProposal() : loadPublishedProposal()
      )),
      loadCached("templates", () => fetch("/api/templates").then((r) => r.ok ? r.json() : { templates: [] })),
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
  }, [isPreviewMode, managedSlug]);

  const hasProposal = useMemo(
    () => Boolean(proposal.boyName && proposal.girlName && proposal.message),
    [proposal]
  );
  
  const gallery = useMemo(
    () => proposal.gallery.filter((g) => g.image.trim()),
    [proposal.gallery]
  );
  
  const timer = useLoveTimer(proposal.firstMeetingDate);
  
  const hasPublishingSetup = Boolean(
    proposal.publishDurationId &&
    proposal.customerDetails.fullName &&
    proposal.customerDetails.email &&
    proposal.customerDetails.phone &&
    proposal.customerDetails.password
  );
  
  const tpl = templates.find(
    (t) => t.id === (isPreviewMode && previewTemplateId ? previewTemplateId : managedProposal?.templateId || proposal.templateId)
  ) ?? null;
  const requestedFamily = managedProposal?.themeFamily || tpl?.family;
  const family: Family = requestedFamily && requestedFamily in THEMES
    ? (requestedFamily as Family)
    : "ethereal";
  const theme = THEMES[family] ?? THEMES.ethereal;

  const handleAccept = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700);
    setTimeout(() => setAccepted(true), 300);
    
    await confetti({
      particleCount: 200,
      spread: 130,
      startVelocity: 52,
      origin: { y: 0.55 },
      colors: [theme.roseGold, theme.champagne, theme.ivory],
    });
  };

  // Loading state
  if (!loaded) {
    return (
      <div style={{
        minHeight: "100vh",
        background: theme.heroGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        `}</style>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.4, 1, 0.4],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: `2px solid ${theme.roseGold}`,
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  // No proposal state
  if (!hasProposal) {
    return (
      <div style={{
        minHeight: "100vh",
        background: theme.heroGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{
          maxWidth: 440,
          textAlign: "center",
          padding: "3rem",
          borderRadius: 28,
          background: theme.surface,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 25px 50px ${theme.shadow}`,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem", opacity: 0.8 }}>💌</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            color: theme.textPrimary,
            marginBottom: "0.75rem",
            fontWeight: 400,
          }}>
            No Proposal Found
          </h1>
          <p style={{ color: theme.textSecondary, marginBottom: "2rem", lineHeight: 1.6 }}>
            Create your eternal love story first to witness the magic unfold.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 24,
              background: theme.roseGradient,
              color: theme.bg[0],
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              boxShadow: `0 10px 30px ${theme.glow}`,
            }}
          >
            Create Proposal
          </Link>
        </div>
      </div>
    );
  }

  // Publishing setup pending
  if (!hasPublishingSetup && !isPreviewMode) {
    return (
      <div style={{
        minHeight: "100vh",
        background: theme.heroGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{
          maxWidth: 480,
          textAlign: "center",
          padding: "3rem",
          borderRadius: 28,
          background: theme.surface,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 25px 50px ${theme.shadow}`,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem", opacity: 0.8 }}>✨</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            color: theme.textPrimary,
            marginBottom: "0.75rem",
            fontWeight: 400,
          }}>
            Almost Ready
          </h1>
          <p style={{ color: theme.textSecondary, marginBottom: "2rem", lineHeight: 1.6 }}>
            Complete your publishing details to unlock the full eternal experience.
          </p>
          <Link
            href="/publish-plan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 24,
              background: theme.roseGradient,
              color: theme.bg[0],
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              boxShadow: `0 10px 30px ${theme.glow}`,
            }}
          >
            Complete Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.heroGradient,
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${theme.bg[0]}; }
        ::-webkit-scrollbar-thumb { background: ${theme.roseGold}40; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.roseGold}60; }
      `}</style>

      <RosePetalField family={family} />

      {/* Ambient Glow */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.roseGold}10 0%, transparent 70%)`,
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "20%",
          right: "5%",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.champagne}08 0%, transparent 70%)`,
          filter: "blur(80px)",
        }} />
      </div>

      {/* Navigation */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "1.25rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: `${theme.bg[0]}80`,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme.glassBorder}`,
      }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 20,
            background: theme.surface,
            color: theme.textSecondary,
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: `1px solid ${theme.glassBorder}`,
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.roseGold;
            e.currentTarget.style.color = theme.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.glassBorder;
            e.currentTarget.style.color = theme.textSecondary;
          }}
        >
          ← Change Style
        </Link>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 20px",
          borderRadius: 20,
          background: theme.surface,
          border: `1px solid ${theme.glassBorder}`,
        }}>
          <span style={{ color: theme.roseGold, fontSize: "1.1rem" }}>{theme.symbol}</span>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: theme.textPrimary }}>
            {theme.label}
          </span>
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          color: theme.textMuted,
          fontSize: "1rem",
        }}>
          {proposal.boyName} & {proposal.girlName}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 2rem 4rem",
          overflow: "hidden",
        }}
      >
        {/* Background Image/Gradient */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            y: scrollY * 0.3,
          }}
        >
          {proposal.heroImage ? (
            <img
              src={proposal.heroImage}
              alt=""
              style={{
                width: "100%",
                height: "120%",
                objectFit: "cover",
                filter: "brightness(0.6) contrast(1.1)",
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "120%",
              background: theme.heroGradient,
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at 50% 50%, ${theme.roseGold}08 0%, transparent 60%)`,
              }} />
            </div>
          )}
          <div style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 0%, ${theme.bg[0]}90 80%, ${theme.bg[0]} 100%)`,
          }} />
        </motion.div>

        {/* Hero Content */}
        <div style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 900,
          textAlign: "center",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 30,
              background: `${theme.roseGold}15`,
              border: `1px solid ${theme.roseGold}30`,
              color: theme.roseGoldLight,
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}>
              An Eternal Love Story
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
              fontWeight: 300,
              lineHeight: 1,
              marginBottom: "1.5rem",
              color: theme.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            To My Beloved
            <br />
            <span style={{
              background: theme.roseGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
              fontWeight: 400,
            }}>
              Wife
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              color: theme.textSecondary,
              maxWidth: 600,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            {proposal.girlName}, every moment with you is a page in our infinite story. 
            This is our forever, written in stardust and bound by love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
            }}
          >
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: theme.roseGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.bg[0],
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              boxShadow: `0 10px 40px ${theme.glow}`,
            }}>
              {proposal.boyName.charAt(0)}
            </div>
            
            <div style={{
              width: 40,
              height: 1,
              background: theme.roseGold,
            }} />
            
            <span style={{ color: theme.roseGold, fontSize: "1.5rem" }}>∞</span>
            
            <div style={{
              width: 40,
              height: 1,
              background: theme.roseGold,
            }} />
            
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: theme.champagneGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.bg[0],
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              boxShadow: `0 10px 40px ${theme.shadow}`,
            }}>
              {proposal.girlName.charAt(0)}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            color: theme.textMuted,
            fontSize: "1.25rem",
          }}
        >
          ↓
        </motion.div>
      </section>

      {/* Story Bento Grid */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Rev>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{
              color: theme.roseGold,
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>
              Our Journey
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginTop: "1rem",
              color: theme.textPrimary,
              fontWeight: 300,
            }}>
              Chapters of Eternity
            </h2>
          </div>
        </Rev>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
          <ElegantCard theme={theme} span={2} delay={0.1} accent>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.75rem",
              marginBottom: "1rem",
              color: theme.textPrimary,
              fontWeight: 400,
            }}>
              The Letter
            </h3>
            <p style={{
              color: theme.textSecondary,
              lineHeight: 1.9,
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              "{proposal.message}"
            </p>
            <div style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: `1px solid ${theme.glassBorder}`,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: theme.roseGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.bg[0],
                fontSize: "0.9rem",
              }}>
                {proposal.boyName.charAt(0)}
              </div>
              <span style={{ color: theme.textMuted, fontSize: "0.9rem" }}>
                Eternally yours, <strong style={{ color: theme.roseGold }}>{proposal.boyName}</strong>
              </span>
            </div>
          </ElegantCard>

          <ElegantCard theme={theme} delay={0.2}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🌹</div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: theme.textPrimary,
              fontWeight: 400,
            }}>
              How We Met
            </h3>
            <p style={{ color: theme.textSecondary, lineHeight: 1.8, fontSize: "0.95rem" }}>
              {proposal.howWeMet || "Two souls destined to find each other in this vast universe, creating a love that transcends time."}
            </p>
          </ElegantCard>

          <ElegantCard theme={theme} delay={0.3}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💗</div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: theme.textPrimary,
              fontWeight: 400,
            }}>
              Why I Love You
            </h3>
            <p style={{ color: theme.textSecondary, lineHeight: 1.8, fontSize: "0.95rem" }}>
              {proposal.whyILoveYou || "For your infinite kindness, your unwavering strength, and the way you make every moment feel like home."}
            </p>
          </ElegantCard>

          <ElegantCard theme={theme} span={2} delay={0.4}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✨</div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.75rem",
              marginBottom: "1rem",
              color: theme.textPrimary,
              fontWeight: 400,
            }}>
              Our Forever
            </h3>
            <p style={{
              color: theme.textSecondary,
              lineHeight: 1.9,
              fontSize: "1.05rem",
            }}>
              {proposal.futureDreams || "Hand in hand, walking toward a future filled with laughter, adventures, and endless love. Building our legacy, one beautiful moment at a time."}
            </p>
          </ElegantCard>
        </div>
      </section>

      {/* Timer Section */}
      {proposal.firstMeetingDate && (
        <section style={{
          padding: "6rem 2rem",
          background: theme.surface,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${theme.roseGold}05 0%, transparent 70%)`,
          }} />
          
          <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Rev>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <span style={{
                  color: theme.roseGold,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>
                  Timeless Devotion
                </span>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  marginTop: "1rem",
                  color: theme.textPrimary,
                  fontWeight: 300,
                  fontStyle: "italic",
                }}>
                  Every Second With You
                </h2>
              </div>
            </Rev>

            <Rev delay={0.2}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "1.25rem",
                maxWidth: 900,
                margin: "0 auto",
              }}>
                {[
                  { v: timer.years, l: "Years" },
                  { v: timer.months, l: "Months" },
                  { v: timer.days, l: "Days" },
                  { v: timer.hours, l: "Hours" },
                  { v: timer.minutes, l: "Minutes" },
                  { v: timer.seconds, l: "Seconds" },
                ].map(({ v, l }, idx) => (
                  <motion.div
                    key={l}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    style={{
                      textAlign: "center",
                      padding: "1.75rem 1rem",
                      background: theme.bg[0],
                      borderRadius: 20,
                      border: `1px solid ${theme.glassBorder}`,
                      boxShadow: `0 10px 40px ${theme.shadow}`,
                    }}
                  >
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      fontWeight: 300,
                      color: theme.roseGold,
                      lineHeight: 1,
                      marginBottom: "0.5rem",
                    }}>
                      {String(v).padStart(2, "0")}
                    </div>
                    <div style={{
                      fontSize: "0.75rem",
                      color: theme.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontWeight: 500,
                    }}>
                      {l}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Rev>

            <Rev delay={0.3}>
              <p style={{
                textAlign: "center",
                marginTop: "2.5rem",
                color: theme.textMuted,
                fontStyle: "italic",
                fontSize: "1.1rem",
              }}>
                Since {new Date(proposal.firstMeetingDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Rev>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Rev>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{
                color: theme.roseGold,
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                Memories
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                marginTop: "1rem",
                color: theme.textPrimary,
                fontWeight: 300,
              }}>
                Moments Frozen in Time
              </h2>
            </div>
          </Rev>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}>
            {gallery.map((item, idx) => (
              <Rev key={item.id} delay={idx * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    background: theme.surface,
                    border: `1px solid ${theme.glassBorder}`,
                    boxShadow: `0 20px 40px ${theme.shadow}`,
                  }}
                >
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src={item.image}
                      alt={item.caption || ""}
                      style={{
                        width: "100%",
                        height: 280,
                        objectFit: "cover",
                        transition: "transform 0.7s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }} className="hover-opacity" />
                  </div>
                  {item.caption && (
                    <div style={{ padding: "1.5rem" }}>
                      <p style={{
                        color: theme.textSecondary,
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}>
                        {item.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              </Rev>
            ))}
          </div>
        </section>
      )}

      {/* Voice Note Section */}
      {proposal.voiceNote && (
        <section style={{ padding: "0 2rem 6rem", maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Rev>
            <VoicePlayer src={proposal.voiceNote} theme={theme} />
          </Rev>
        </section>
      )}

      {/* Games Section */}
      <section style={{ padding: "6rem 2rem", background: theme.surface, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Rev>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{
                color: theme.roseGold,
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                Play Together
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                marginTop: "1rem",
                color: theme.textPrimary,
                fontWeight: 300,
              }}>
                Games of Love
              </h2>
              <p style={{
                color: theme.textSecondary,
                marginTop: "1rem",
                maxWidth: 500,
                margin: "1rem auto 0",
                fontSize: "1.05rem",
              }}>
                Little challenges to celebrate our beautiful journey
              </p>
            </div>
          </Rev>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
          }}>
            <Rev delay={0.1}>
              <MemoryGame theme={theme} />
            </Rev>
            <Rev delay={0.2}>
              <LoveQuiz theme={theme} proposal={proposal} />
            </Rev>
            <Rev delay={0.3}>
              <HeartCatcher theme={theme} />
            </Rev>
          </div>
        </div>
      </section>

      {/* Proposal Card */}
      <section style={{ padding: "8rem 2rem", maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Rev>
          <div style={{
            background: theme.surface,
            borderRadius: 32,
            padding: "clamp(2.5rem, 6vw, 4rem)",
            border: `1px solid ${theme.roseGold}30`,
            boxShadow: `0 40px 80px ${theme.shadow}, 0 0 0 1px ${theme.glassBorder}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative gradient */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: theme.roseGradient,
            }} />
            
            <div style={{
              position: "absolute",
              top: -150,
              right: -150,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.roseGold}10 0%, transparent 70%)`,
              filter: "blur(80px)",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <AnimatePresence mode="wait">
                {!accepted ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div style={{ 
                      fontSize: "3.5rem", 
                      marginBottom: "1.5rem",
                      filter: "drop-shadow(0 10px 20px rgba(183, 110, 121, 0.3))"
                    }}>
                      💍
                    </div>
                    
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                      color: theme.textPrimary,
                      marginBottom: "1rem",
                      lineHeight: 1.3,
                      fontWeight: 300,
                    }}>
                      {theme.questionText}
                      <br />
                      <span style={{ 
                        color: theme.roseGold, 
                        fontStyle: "italic",
                        fontWeight: 400,
                      }}>
                        {proposal.girlName}?
                      </span>
                    </h2>
                    
                    <p style={{
                      color: theme.textSecondary,
                      marginBottom: "2.5rem",
                      fontSize: "1.1rem",
                      lineHeight: 1.7,
                      fontStyle: "italic",
                    }}>
                      "You are my today and all of my tomorrows."
                    </p>

                    <motion.button
                      onClick={handleAccept}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        position: "relative",
                        padding: "1.25rem 3.5rem",
                        borderRadius: 30,
                        border: "none",
                        background: theme.roseGradient,
                        color: theme.bg[0],
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: `0 15px 40px ${theme.glow}`,
                        overflow: "hidden",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {ripples.map((r) => (
                        <span
                          key={r.id}
                          style={{
                            position: "absolute",
                            left: r.x,
                            top: r.y,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.6)",
                            animation: "ripple 0.6s ease-out forwards",
                            pointerEvents: "none",
                          }}
                        />
                      ))}
                      Yes, Forever {theme.symbol}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="accepted"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ 
                        fontSize: "5rem", 
                        marginBottom: "1.5rem",
                        filter: "drop-shadow(0 10px 30px rgba(183, 110, 121, 0.4))"
                      }}
                    >
                      💕
                    </motion.div>
                    
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2rem, 5vw, 3rem)",
                      color: theme.textPrimary,
                      marginBottom: "1rem",
                      fontWeight: 300,
                    }}>
                      She Said <span style={{ color: theme.roseGold, fontStyle: "italic" }}>Yes!</span>
                    </h2>
                    
                    <p style={{
                      color: theme.textSecondary,
                      fontSize: "1.15rem",
                      lineHeight: 1.7,
                      marginBottom: "2rem",
                    }}>
                      {proposal.boyName} and {proposal.girlName} — 
                      a love that grows more beautiful with each passing moment.
                    </p>
                    
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                    }}>
                      {["💗", "💍", "🥂", "🏠", "✨"].map((emoji, i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -12, 0] }}
                          transition={{ 
                            duration: 2, 
                            delay: i * 0.15, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          style={{ 
                            fontSize: "1.75rem",
                            filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.3))"
                          }}
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Rev>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "3rem 2rem",
        borderTop: `1px solid ${theme.glassBorder}`,
        background: theme.bg[0],
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: theme.textMuted,
            fontSize: "1.1rem",
          }}>
            {proposal.boyName} & {proposal.girlName} — Eternally
          </p>
          <p style={{ color: theme.textMuted, fontSize: "0.9rem" }}>
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
