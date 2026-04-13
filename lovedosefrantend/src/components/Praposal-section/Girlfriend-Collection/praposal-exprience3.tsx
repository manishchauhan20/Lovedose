"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { Heart, Music, Calendar, Gift, Sparkles, Play, Pause, Volume2, Lock, Unlock, Star, Send, Timer, Trophy, Gamepad2, Quote, Camera, Mic, ArrowLeft, Infinity as InfinityIcon, Crown, Gem, Flame } from "lucide-react";

/* ─────────────────────────────────────────────
Premium Design System 2026 - Midnight Rose
───────────────────────────────────────────── */
const DS = {
    // Core Palette - Midnight Rose Theme
    colors: {
        midnight: "#0f0c29",
        midnightLight: "#1a1638",
        midnightDark: "#090714",
        
        rose: {
            50: "#fff1f3",
            100: "#ffe4e8",
            200: "#fecdd6",
            300: "#fda4b4",
            400: "#fb7185",
            500: "#f43f5e",
            600: "#e11d48",
            700: "#be123c",
            800: "#9f1239",
            900: "#881337",
        },
        
        purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7c3aed",
            800: "#6b21a8",
            900: "#581c87",
        },
        
        gold: {
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b",
        },
    },

    // Semantic Colors
    primary: "#e11d48", // Rose 600
    primaryLight: "#fb7185", // Rose 400
    primaryDark: "#9f1239", // Rose 800
    secondary: "#7c3aed", // Purple 700
    accent: "#f59e0b", // Gold 500
    
    // Backgrounds
    bg: {
        primary: "#0f0c29",
        secondary: "#1a1638",
        card: "rgba(255, 255, 255, 0.03)",
        elevated: "rgba(255, 255, 255, 0.05)",
    },

    // Text
    text: {
        primary: "#ffffff",
        secondary: "rgba(255, 255, 255, 0.7)",
        muted: "rgba(255, 255, 255, 0.5)",
        inverse: "#0f0c29",
    },

    // Gradients
    gradient: {
        hero: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        card: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        primary: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
        secondary: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
        gold: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        roseGold: "linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)",
    },

    // Spacing
    space: {
        xs: "0.5rem",   // 8px
        sm: "1rem",     // 16px
        md: "1.5rem",   // 24px
        lg: "2rem",     // 32px
        xl: "3rem",     // 48px
        "2xl": "4rem",  // 64px
        "3xl": "6rem",  // 96px
    },

    // Typography
    font: {
        sans: "var(--font-inter), system-ui, sans-serif",
        display: "var(--font-playfair), Georgia, serif",
    },

    size: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
    },

    // Shadows
    shadow: {
        sm: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
        md: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
        lg: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        glow: "0 0 60px -15px rgba(225, 29, 72, 0.5)",
        purpleGlow: "0 0 60px -15px rgba(124, 58, 237, 0.4)",
    },

    // Radius
    radius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
    },
} as const;

/* ─────────────────────────────────────────────
Types
───────────────────────────────────────────── */
interface GalleryItem {
    id: string;
    image: string;
    caption?: string;
}

interface ProposalData {
    boyName: string;
    girlName: string;
    message: string;
    howWeMet: string;
    firstMeetingDate: string;
    nickname: string;
    whyILoveYou: string;
    futureDreams: string;
    heroImage: string;
    heroImageCaption: string;
    gallery: GalleryItem[];
    voiceNote?: string;
}

/* ─────────────────────────────────────────────
Premium Glass Card with 3D Tilt
───────────────────────────────────────────── */
function GlassCard({
    children,
    className = "",
    hover = true,
    glow = false,
    padding = "lg",
    variant = "default",
    intensity = 1,
}: {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
    padding?: "sm" | "md" | "lg" | "xl" | "2xl";
    variant?: "default" | "primary" | "gold" | "purple";
    intensity?: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || !hover) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setTilt({
            x: (y - 0.5) * 12,
            y: (x - 0.5) * -12,
        });
        setGlarePosition({ x: x * 100, y: y * 100 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const paddingMap = {
        sm: DS.space.sm,
        md: DS.space.md,
        lg: DS.space.lg,
        xl: DS.space.xl,
        "2xl": DS.space["2xl"],
    };

    const variantStyles = {
        default: {
            bg: DS.gradient.card,
            border: "rgba(255, 255, 255, 0.08)",
            glow: DS.shadow.glow,
        },
        primary: {
            bg: "linear-gradient(145deg, rgba(225, 29, 72, 0.15) 0%, rgba(190, 18, 60, 0.05) 100%)",
            border: "rgba(225, 29, 72, 0.3)",
            glow: DS.shadow.glow,
        },
        gold: {
            bg: "linear-gradient(145deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)",
            border: "rgba(245, 158, 11, 0.3)",
            glow: "0 0 40px -10px rgba(245, 158, 11, 0.4)",
        },
        purple: {
            bg: "linear-gradient(145deg, rgba(124, 58, 237, 0.16) 0%, rgba(147, 51, 234, 0.06) 100%)",
            border: "rgba(124, 58, 237, 0.3)",
            glow: DS.shadow.purpleGlow,
        },
    };

    const style = variantStyles[variant] ?? variantStyles.default;

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: "preserve-3d",
            }}
            className={className}
            whileHover={hover ? { scale: 1.02, zIndex: 10 } : {}}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
            <div
                style={{
                    position: "relative",
                    borderRadius: DS.radius["2xl"],
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    boxShadow: isHovered ? `${DS.shadow.lg}, ${glow ? style.glow : ''}` : DS.shadow.sm,
                    backdropFilter: `blur(${16 + intensity * 8}px)`,
                    padding: paddingMap[padding],
                    overflow: "hidden",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
            >
                {/* Glare Effect */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.3s",
                        pointerEvents: "none",
                        borderRadius: DS.radius["2xl"],
                    }}
                />
                
                {/* Content */}
                <div style={{ position: "relative", zIndex: 2, transform: "translateZ(30px)" }}>
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
Section Header Component
───────────────────────────────────────────── */
function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    align = "center",
    variant = "default",
}: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    align?: "left" | "center";
    variant?: "default" | "gold";
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            style={{
                textAlign: align,
                marginBottom: DS.space.xl,
            }}
        >
            {Icon && (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: DS.radius.xl,
                        background: variant === "gold" ? DS.gradient.gold : DS.gradient.primary,
                        marginBottom: DS.space.md,
                        boxShadow: variant === "gold" ? "0 10px 30px -10px rgba(245, 158, 11, 0.5)" : DS.shadow.glow,
                    }}
                >
                    <Icon size={28} color="white" strokeWidth={2} />
                </motion.div>
            )}

            <h2 style={{
                fontSize: DS.size["4xl"],
                fontWeight: 700,
                color: DS.text.primary,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: subtitle ? DS.space.sm : 0,
                background: variant === "gold" ? DS.gradient.gold : "none",
                WebkitBackgroundClip: variant === "gold" ? "text" : "unset",
                WebkitTextFillColor: variant === "gold" ? "transparent" : "white",
            }}>
                {title}
            </h2>

            {subtitle && (
                <p style={{
                    fontSize: DS.size.lg,
                    color: DS.text.secondary,
                    maxWidth: align === "center" ? "600px" : "100%",
                    margin: align === "center" ? "0 auto" : "0",
                    lineHeight: 1.6,
                }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
Premium Button Component
───────────────────────────────────────────── */
function Button({
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    onClick,
    fullWidth = false,
    disabled = false,
}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "gold";
    size?: "sm" | "md" | "lg";
    icon?: React.ElementType;
    onClick?: () => void;
    fullWidth?: boolean;
    disabled?: boolean;
}) {
    const sizeStyles = {
        sm: { padding: "0.625rem 1.25rem", fontSize: DS.size.sm },
        md: { padding: "0.875rem 1.75rem", fontSize: DS.size.base },
        lg: { padding: "1.125rem 2.5rem", fontSize: DS.size.lg },
    };

    const variantStyles = {
        primary: {
            background: DS.gradient.primary,
            color: "white",
            border: "none",
            boxShadow: DS.shadow.glow,
        },
        secondary: {
            background: "transparent",
            color: DS.colors.rose[300],
            border: `1.5px solid ${DS.colors.rose[700]}`,
            boxShadow: "none",
        },
        ghost: {
            background: "rgba(255,255,255,0.05)",
            color: DS.text.secondary,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "none",
        },
        gold: {
            background: DS.gradient.gold,
            color: DS.colors.midnight,
            border: "none",
            boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.4)",
        },
    };

    const style = variantStyles[variant];

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.03, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: DS.space.sm,
                borderRadius: DS.radius.full,
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                ...sizeStyles[size],
                ...style,
                width: fullWidth ? "100%" : "auto",
            }}
        >
            {Icon && <Icon size={18} strokeWidth={2.5} />}
            {children}
        </motion.button>
    );
}

/* ─────────────────────────────────────────────
Badge Component
───────────────────────────────────────────── */
function Badge({ children, color = "primary" }: { children: React.ReactNode; color?: "primary" | "secondary" | "gold" | "purple" }) {
    const colorMap = {
        primary: { bg: "rgba(225, 29, 72, 0.2)", text: "#fb7185", border: "rgba(225, 29, 72, 0.3)" },
        secondary: { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.1)" },
        gold: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
        purple: { bg: "rgba(124, 58, 237, 0.2)", text: "#c084fc", border: "rgba(124, 58, 237, 0.3)" },
    };

    const c = colorMap[color];

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: DS.radius.full,
            background: c.bg,
            color: c.text,
            fontSize: DS.size.xs,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: `1px solid ${c.border}`,
            backdropFilter: "blur(10px)",
        }}>
            {children}
        </span>
    );
}

/* ─────────────────────────────────────────────
Floating Particles Background
───────────────────────────────────────────── */
function FloatingParticles() {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.3 + 0.1,
            color: Math.random() > 0.5 ? DS.colors.rose[400] : DS.colors.purple[400],
        }));
    }, []);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
        }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        background: p.color,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [p.opacity, p.opacity * 2, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
Typewriter Component
───────────────────────────────────────────── */
function TypewriterText({
    text,
    delay = 0,
    speed = 50,
    className = "",
    onComplete,
    gradient = false,
}: {
    text: string;
    delay?: number;
    speed?: number;
    className?: string;
    onComplete?: () => void;
    gradient?: boolean;
}) {
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(true);
            let index = 0;
            const interval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayText(text.slice(0, index));
                    index++;
                } else {
                    clearInterval(interval);
                    setIsTyping(false);
                    onComplete?.();
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [text, delay, speed, onComplete]);

    return (
        <span 
            className={className} 
            style={{ 
                display: "inline",
                background: gradient ? DS.gradient.roseGold : "none",
                WebkitBackgroundClip: gradient ? "text" : "unset",
                WebkitTextFillColor: gradient ? "transparent" : "inherit",
            }}
        >
            {displayText}
            {isTyping && (
                <motion.span
                    style={{
                        display: "inline-block",
                        width: 3,
                        height: "1.1em",
                        background: gradient ? DS.colors.gold[400] : DS.colors.rose[400],
                        marginLeft: 4,
                        verticalAlign: "middle",
                        borderRadius: 2,
                    }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </span>
    );
}

/* ─────────────────────────────────────────────
GAME 1: Love Quiz (Premium)
───────────────────────────────────────────── */
function LoveQuiz({ proposal }: { proposal: ProposalData }) {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const questions = [
        {
            q: `When did ${proposal.boyName} first meet ${proposal.girlName}?`,
            options: [
                new Date(proposal.firstMeetingDate).toLocaleDateString(),
                "Last year",
                "In college",
                "At a party"
            ],
            correct: 0
        },
        {
            q: `What is ${proposal.girlName}'s special nickname?`,
            options: [proposal.nickname, "Princess", "Queen", "Angel"],
            correct: 0
        },
        {
            q: "What is the color of true love?",
            options: ["Red", "Rose", "Pink", "All of the above"],
            correct: 3
        },
        {
            q: `Who loves ${proposal.girlName} more?`,
            options: [proposal.boyName, "No one", "Everyone", proposal.boyName + " forever"],
            correct: 3
        }
    ];

    const handleAnswer = (idx: number) => {
        setSelectedAnswer(idx);
        if (idx === questions[currentQ].correct) {
            setScore(s => s + 1);
        }
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(c => c + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 800);
    };

    const reset = () => {
        setStarted(false);
        setCurrentQ(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
    };

    if (!started) {
        return (
            <GlassCard padding="xl" className="text-center h-full flex flex-col justify-center" variant="primary" glow>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{
                        width: 96,
                        height: 96,
                        borderRadius: DS.radius["2xl"],
                        background: DS.gradient.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        marginBottom: DS.space.lg,
                        boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.5)",
                    }}
                >
                    <Trophy size={40} color={DS.colors.midnight} />
                </motion.div>
                
                <Badge color="gold">Couple Challenge</Badge>
                
                <h3 style={{
                    fontSize: DS.size["3xl"],
                    fontWeight: 700,
                    color: DS.text.primary,
                    marginTop: DS.space.md,
                    marginBottom: DS.space.sm,
                }}>
                    Love Quiz
                </h3>
                
                <p style={{
                    color: DS.text.secondary,
                    marginBottom: DS.space.lg,
                    lineHeight: 1.6,
                    maxWidth: 320,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}>
                    Test how well you know your story together with a short romantic challenge
                </p>
                
                <Button onClick={() => setStarted(true)} size="lg" icon={Sparkles} variant="gold">
                    Start Challenge
                </Button>
            </GlassCard>
        );
    }

    if (showResult) {
        const percentage = (score / questions.length) * 100;
        return (
            <GlassCard padding="xl" className="text-center" variant="gold" glow>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <div style={{ fontSize: "5rem", marginBottom: DS.space.md }}>
                        {percentage === 100 ? "🏆" : percentage >= 75 ? "🌟" : "💝"}
                    </div>
                    <h3 style={{
                        fontSize: DS.size["4xl"],
                        fontWeight: 800,
                        background: DS.gradient.gold,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: DS.space.sm,
                    }}>
                        {percentage}%
                    </h3>
                    <p style={{
                        color: DS.text.secondary,
                        marginBottom: DS.space.lg,
                        fontSize: DS.size.lg,
                    }}>
                        {percentage === 100
                            ? "Perfect! You know our love by heart!"
                            : "Every love story is unique!"}
                    </p>
                    <Button onClick={reset} variant="secondary" icon={Timer}>
                        Play Again
                    </Button>
                </motion.div>
            </GlassCard>
        );
    }

    return (
        <GlassCard padding="lg" className="h-full" variant="primary">
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: DS.space.lg
            }}>
                <Badge color="purple">Question {currentQ + 1}/{questions.length}</Badge>
                <div style={{ display: "flex", gap: 6 }}>
                    {questions.map((_, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                scale: i === currentQ ? 1.2 : 1,
                                backgroundColor: i <= currentQ ? DS.colors.rose[500] : "rgba(255,255,255,0.1)",
                            }}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                            }}
                        />
                    ))}
                </div>
            </div>

            <h3 style={{
                fontSize: DS.size.xl,
                fontWeight: 600,
                color: DS.text.primary,
                marginBottom: DS.space.lg,
                lineHeight: 1.4,
            }}>
                {questions[currentQ].q}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: DS.space.sm }}>
                {questions[currentQ].options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => selectedAnswer === null && handleAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        whileHover={selectedAnswer === null ? { x: 8, scale: 1.02 } : {}}
                        style={{
                            padding: DS.space.md,
                            borderRadius: DS.radius.lg,
                            border: "1.5px solid",
                            borderColor: selectedAnswer === null
                                ? "rgba(255,255,255,0.1)"
                                : idx === questions[currentQ].correct
                                    ? "#22c55e"
                                    : selectedAnswer === idx
                                        ? "#ef4444"
                                        : "rgba(255,255,255,0.1)",
                            background: selectedAnswer === null
                                ? "rgba(255,255,255,0.03)"
                                : idx === questions[currentQ].correct
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : selectedAnswer === idx
                                        ? "rgba(239, 68, 68, 0.1)"
                                        : "rgba(255,255,255,0.03)",
                            color: DS.text.primary,
                            cursor: selectedAnswer === null ? "pointer" : "default",
                            textAlign: "left",
                            fontWeight: 500,
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            gap: DS.space.md,
                        }}
                    >
                        <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: selectedAnswer === null
                                ? "rgba(225, 29, 72, 0.2)"
                                : idx === questions[currentQ].correct
                                    ? "#22c55e"
                                    : selectedAnswer === idx
                                        ? "#ef4444"
                                        : "rgba(255,255,255,0.1)",
                            color: selectedAnswer !== null && (idx === questions[currentQ].correct || selectedAnswer === idx)
                                ? "white"
                                : DS.colors.rose[300],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: DS.size.sm,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                    </motion.button>
                ))}
            </div>
        </GlassCard>
    );
}

/* ─────────────────────────────────────────────
GAME 2: Memory Match (Premium)
───────────────────────────────────────────── */
function MemoryGame() {
    const [cards, setCards] = useState<Array<{ id: number, icon: string, flipped: boolean, matched: boolean }>>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [started, setStarted] = useState(false);

    const icons = ["💕", "💑", "💍", "🌹", "💌", "🎁", "💖", "⭐"];

    useEffect(() => {
        if (started) {
            const shuffled = [...icons, ...icons]
                .sort(() => Math.random() - 0.5)
                .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
            setCards(shuffled);
        }
    }, [started]);

    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first].icon === cards[second].icon) {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) =>
                        i === first || i === second ? { ...c, matched: true } : c
                    ));
                    setFlipped([]);
                }, 600);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) =>
                        i === first || i === second ? { ...c, flipped: false } : c
                    ));
                    setFlipped([]);
                }, 1000);
            }
            setMoves(m => m + 1);
        }
    }, [flipped, cards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.matched)) {
            setGameWon(true);
        }
    }, [cards]);

    const handleCardClick = (idx: number) => {
        if (flipped.length < 2 && !cards[idx].flipped && !cards[idx].matched) {
            setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c));
            setFlipped(prev => [...prev, idx]);
        }
    };

    const reset = () => {
        setStarted(false);
        setFlipped([]);
        setMoves(0);
        setGameWon(false);
        setCards([]);
    };

    if (!started) {
        return (
            <GlassCard padding="xl" className="text-center h-full flex flex-col justify-center" variant="purple" glow>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: DS.radius["2xl"],
                        background: DS.gradient.secondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        marginBottom: DS.space.lg,
                        boxShadow: DS.shadow.purpleGlow,
                    }}
                >
                    <Gamepad2 size={36} color="white" />
                </motion.div>
                
                <h3 style={{
                    fontSize: DS.size["2xl"],
                    fontWeight: 700,
                    color: DS.text.primary,
                    marginBottom: DS.space.sm,
                }}>
                    Memory Match
                </h3>
                
                <p style={{
                    color: DS.text.secondary,
                    marginBottom: DS.space.lg,
                }}>
                    Find the matching love symbols
                </p>
                
                <Button onClick={() => setStarted(true)} size="lg" icon={Sparkles}>
                    Play Now
                </Button>
            </GlassCard>
        );
    }

    return (
        <GlassCard padding="md" className="h-full">
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: DS.space.md
            }}>
                <Badge color="secondary">Moves: {moves}</Badge>
                {gameWon && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            color: DS.colors.gold[400],
                            fontWeight: 700,
                        }}
                    >
                        🎉 Completed!
                    </motion.span>
                )}
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: DS.space.sm,
                pointerEvents: flipped.length === 2 ? "none" : "auto"
            }}>
                {cards.map((card, idx) => (
                    <motion.button
                        key={card.id}
                        onClick={() => handleCardClick(idx)}
                        whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ 
                            rotateY: card.flipped || card.matched ? 180 : 0,
                            scale: card.matched ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.4 }}
                        style={{
                            aspectRatio: "1",
                            borderRadius: DS.radius.lg,
                            border: "none",
                            background: card.flipped || card.matched
                                ? DS.gradient.primary
                                : "rgba(255,255,255,0.05)",
                            cursor: card.flipped || card.matched ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.75rem",
                            boxShadow: card.matched
                                ? `0 0 20px ${DS.colors.rose[500]}80`
                                : "none",
                            transformStyle: "preserve-3d",
                        }}
                    >
                        <span style={{
                            transform: "rotateY(180deg)",
                            opacity: card.flipped || card.matched ? 1 : 0,
                        }}>
                            {card.icon}
                        </span>
                        {!card.flipped && !card.matched && (
                            <Heart size={20} color={DS.colors.rose[500]} style={{ opacity: 0.5 }} />
                        )}
                    </motion.button>
                ))}
            </div>

            {gameWon && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: DS.space.md }}
                >
                    <Button onClick={reset} variant="secondary" fullWidth icon={Timer}>
                        Play Again
                    </Button>
                </motion.div>
            )}
        </GlassCard>
    );
}

/* ─────────────────────────────────────────────
GAME 3: Love Calculator (Premium)
───────────────────────────────────────────── */
function LoveCalculator({ boyName, girlName }: { boyName: string; girlName: string }) {
    const [percentage, setPercentage] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, color: string }>>([]);

    const calculateLove = () => {
        setIsCalculating(true);
        setShowResult(false);
        setPercentage(0);

        const colors = [DS.colors.rose[500], DS.colors.purple[500], DS.colors.gold[400]];
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setParticles(newParticles);

        let current = 0;
        const target = 98 + Math.floor(Math.random() * 3);
        const interval = setInterval(() => {
            current += Math.floor(Math.random() * 2) + 1;
            if (current >= target) {
                current = target;
                clearInterval(interval);
                setIsCalculating(false);
                setShowResult(true);
                setTimeout(() => setParticles([]), 3000);
            }
            setPercentage(current);
        }, 30);
    };

    return (
        <GlassCard padding="xl" className="text-center relative overflow-hidden" variant="primary" glow>
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                        animate={{
                            scale: [0, 1, 0],
                            x: p.x,
                            y: p.y,
                            opacity: [1, 1, 0]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "40%",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: p.color,
                            pointerEvents: "none",
                            boxShadow: `0 0 15px ${p.color}`,
                        }}
                    />
                ))}
            </AnimatePresence>

            <motion.div
                style={{ fontSize: "4rem", marginBottom: DS.space.md }}
                animate={isCalculating ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                } : { rotate: 0 }}
                transition={{ duration: 2, repeat: isCalculating ? Infinity : 0 }}
            >
                {showResult ? "💑" : "💕"}
            </motion.div>

            <h3 style={{
                fontSize: DS.size.xl,
                fontWeight: 700,
                color: DS.text.primary,
                marginBottom: DS.space.lg,
            }}>
                Love Compatibility
            </h3>

            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: DS.space.md,
                marginBottom: DS.space.lg,
                flexWrap: "wrap"
            }}>
                <GlassCard padding="md" hover={false}>
                    <span style={{ color: DS.colors.rose[300], fontWeight: 700, fontSize: DS.size.lg }}>
                        {boyName}
                    </span>
                </GlassCard>

                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Heart size={32} fill={DS.colors.rose[500]} color={DS.colors.rose[500]} />
                </motion.div>

                <GlassCard padding="md" hover={false}>
                    <span style={{ color: DS.colors.rose[300], fontWeight: 700, fontSize: DS.size.lg }}>
                        {girlName}
                    </span>
                </GlassCard>
            </div>

            {!showResult ? (
                <Button
                    onClick={calculateLove}
                    size="lg"
                    icon={isCalculating ? Timer : Sparkles}
                    disabled={isCalculating}
                >
                    {isCalculating ? "Calculating..." : "Calculate Love %"}
                </Button>
            ) : (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <div
                        style={{
                            fontSize: DS.size["6xl"],
                            fontWeight: 800,
                            background: DS.gradient.roseGold,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            lineHeight: 1,
                            marginBottom: DS.space.sm,
                        }}
                    >
                        {percentage}%
                    </div>
                    <p style={{ color: DS.text.secondary, fontSize: DS.size.lg }}>
                        Perfect Match! 🔥
                    </p>
                </motion.div>
            )}
        </GlassCard>
    );
}

/* ─────────────────────────────────────────────
Voice Note Player (Premium)
───────────────────────────────────────────── */
function VoiceNotePlayer({ voiceNote }: { voiceNote?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (voiceNote && audioRef.current) {
            audioRef.current.src = voiceNote;
            audioRef.current.onloadedmetadata = () => {
                setDuration(audioRef.current?.duration || 0);
            };
            audioRef.current.ontimeupdate = () => {
                setProgress((audioRef.current?.currentTime || 0) / duration * 100);
            };
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, [voiceNote, duration]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!voiceNote) return null;

    return (
        <GlassCard padding="lg" variant="gold">
            <audio ref={audioRef} style={{ display: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: DS.space.md }}>
                <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: DS.gradient.gold,
                        border: "none",
                        color: DS.colors.midnight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.5)",
                        flexShrink: 0,
                    }}
                >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </motion.button>

                <div style={{ flex: 1 }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: DS.space.xs,
                        marginBottom: DS.space.xs
                    }}>
                        <Mic size={18} color={DS.colors.gold[400]} />
                        <span style={{
                            fontSize: DS.size.sm,
                            color: DS.text.secondary,
                            fontWeight: 600
                        }}>
                            Special Voice Message
                        </span>
                    </div>

                    <div style={{
                        height: 6,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: DS.radius.full,
                        overflow: "hidden",
                    }}>
                        <motion.div
                            style={{
                                height: "100%",
                                background: DS.gradient.gold,
                                borderRadius: DS.radius.full,
                            }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: DS.space.xs
                    }}>
                        <span style={{ fontSize: DS.size.xs, color: DS.text.muted }}>
                            {Math.floor((progress / 100) * duration)}s
                        </span>
                        <span style={{ fontSize: DS.size.xs, color: DS.text.muted }}>
                            {Math.floor(duration)}s
                        </span>
                    </div>
                </div>

                <Volume2 size={24} color={DS.text.muted} />
            </div>
        </GlassCard>
    );
}

/* ─────────────────────────────────────────────
Photo Gallery (Premium with Lightbox)
───────────────────────────────────────────── */
function PhotoGallery({ gallery }: { gallery: GalleryItem[] }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: DS.space.lg
            }}>
                {gallery.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedImage(item.image)}
                        style={{
                            position: "relative",
                            borderRadius: DS.radius["2xl"],
                            overflow: "hidden",
                            cursor: "pointer",
                            aspectRatio: "4/5",
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundImage: `url(${item.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                            animate={{
                                scale: hoveredIndex === idx ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                        />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredIndex === idx ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(transparent 30%, rgba(15, 12, 41, 0.9))",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: DS.space.lg,
                            }}
                        >
                            <p style={{ 
                                color: "white", 
                                fontWeight: 600, 
                                fontSize: DS.size.xl,
                                marginBottom: DS.space.xs,
                            }}>
                                {item.caption || "Precious Memory"}
                            </p>
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: DS.space.xs,
                                color: "rgba(255,255,255,0.7)",
                                fontSize: DS.size.sm,
                            }}>
                                <Camera size={16} />
                                <span>Click to view</span>
                            </div>
                        </motion.div>

                        {/* Border glow on hover */}
                        <motion.div
                            animate={{ opacity: hoveredIndex === idx ? 1 : 0 }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: DS.radius["2xl"],
                                border: `2px solid ${DS.colors.rose[500]}`,
                                pointerEvents: "none",
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(15, 12, 41, 0.95)",
                            backdropFilter: "blur(20px)",
                            zIndex: 1000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: DS.space.lg,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "relative",
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                borderRadius: DS.radius["2xl"],
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                src={selectedImage}
                                alt="Full view"
                                width={1200}
                                height={800}
                                style={{
                                    borderRadius: DS.radius["2xl"],
                                    objectFit: "contain",
                                    maxHeight: "90vh",
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedImage(null)}
                                style={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.2)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontSize: 20,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                ✕
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ─────────────────────────────────────────────
Countdown Timer (Premium)
───────────────────────────────────────────── */
function CountdownTimer({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date().getTime() - new Date(targetDate).getTime();
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));

            setTimeLeft({
                days: Math.abs(days),
                hours: Math.abs(Math.floor((difference / (1000 * 60 * 60)) % 24)),
                minutes: Math.abs(Math.floor((difference / 1000 / 60) % 60)),
                seconds: Math.abs(Math.floor((difference / 1000) % 60)),
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div style={{ textAlign: "center" }}>
            <GlassCard padding="md" hover={false} variant="gold">
                <motion.span
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        fontSize: DS.size["3xl"],
                        fontWeight: 800,
                        background: DS.gradient.gold,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "block",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {value.toString().padStart(2, "0")}
                </motion.span>
            </GlassCard>
            <span style={{
                fontSize: DS.size.xs,
                color: DS.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginTop: DS.space.sm,
                display: "block",
            }}>
                {label}
            </span>
        </div>
    );

    return (
        <GlassCard padding="lg" variant="purple" glow>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: DS.space.sm,
                marginBottom: DS.space.md
            }}>
                <Calendar size={24} color={DS.colors.purple[400]} />
                <span style={{
                    fontSize: DS.size.sm,
                    color: DS.text.secondary,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                }}>
                    Time Together
                </span>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: DS.space.sm,
                flexWrap: "wrap",
            }}>
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <TimeUnit value={timeLeft.seconds} label="Secs" />
            </div>
        </GlassCard>
    );
}

/* ─────────────────────────────────────────────
Story Cards (Premium)
───────────────────────────────────────────── */
function StorySection({ proposal }: { proposal: ProposalData }) {
    const stories = [
        {
            label: "How We Met",
            value: proposal.howWeMet,
            icon: Sparkles,
            color: DS.colors.gold[400],
            gradient: DS.gradient.gold,
        },
        {
            label: "Why I Love You",
            value: proposal.whyILoveYou,
            icon: Heart,
            color: DS.colors.rose[400],
            gradient: DS.gradient.primary,
        },
        {
            label: "Future Dreams",
            value: proposal.futureDreams,
            icon: Star,
            color: DS.colors.purple[400],
            gradient: DS.gradient.secondary,
        },
    ];

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: DS.space.lg
        }}>
            {stories.map((story, idx) => (
                <motion.div
                    key={story.label}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
                    <GlassCard padding="xl" className="h-full" glow>
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: DS.radius.xl,
                                background: story.gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: DS.space.lg,
                                boxShadow: `0 15px 35px -10px ${story.color}50`,
                            }}
                        >
                            <story.icon size={32} color="white" strokeWidth={2} />
                        </div>

                        <p style={{
                            fontSize: DS.size.xs,
                            color: story.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            marginBottom: DS.space.sm,
                            fontWeight: 700,
                        }}>
                            {story.label}
                        </p>

                        <p style={{
                            fontSize: DS.size.lg,
                            lineHeight: 1.7,
                            color: DS.text.primary,
                            fontWeight: 500,
                        }}>
                            {story.value || `A beautiful chapter of our love story...`}
                        </p>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
Hero Section (Premium)
───────────────────────────────────────────── */
function HeroSection({ proposal }: { proposal: ProposalData }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);

    return (
        <motion.section
            style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                paddingTop: DS.space["2xl"],
                paddingBottom: DS.space["2xl"],
            }}
        >
            {/* Background Elements */}
            <motion.div
                style={{ y: y1, position: "absolute", top: "5%", right: "0%", width: 600, height: 600 }}
            >
                <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${DS.colors.rose[600]}30, transparent 70%)`,
                    filter: "blur(100px)",
                }} />
            </motion.div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: DS.space["3xl"],
                alignItems: "center",
                width: "100%",
                position: "relative",
                zIndex: 10,
            }}>
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ marginBottom: DS.space.lg }}
                    >
                        <Badge color="primary">
                            <Heart size={14} fill="currentColor" style={{ marginRight: 6 }} />
                            For My Love, {proposal.girlName}
                        </Badge>
                    </motion.div>

                    <h1 style={{
                        fontSize: "clamp(3rem, 6vw, 5.5rem)",
                        lineHeight: 1.05,
                        marginBottom: DS.space.lg,
                        color: DS.text.primary,
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                    }}>
                        <TypewriterText text="Every moment" delay={300} speed={60} />
                        <br />
                        <TypewriterText text="with you is" delay={800} speed={60} gradient />
                        <br />
                        <TypewriterText text="pure magic ✨" delay={1300} speed={60} />
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                        style={{
                            fontSize: DS.size.xl,
                            lineHeight: 1.8,
                            color: DS.text.secondary,
                            marginBottom: DS.space.xl,
                            maxWidth: 540,
                        }}
                    >
                        {proposal.message || "You make my world brighter every single day with your smile..."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                        style={{ display: "flex", gap: DS.space.md, flexWrap: "wrap" }}
                    >
                        <GlassCard padding="md" hover intensity={0.5}>
                            <div style={{ display: "flex", alignItems: "center", gap: DS.space.md }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: DS.radius.lg,
                                    background: DS.gradient.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: DS.shadow.glow,
                                }}>
                                    <span style={{
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: DS.size.xl
                                    }}>
                                        {proposal.boyName?.[0] || "M"}
                                    </span>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: DS.size.xs,
                                        color: DS.text.muted,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontWeight: 600,
                                        marginBottom: 2,
                                    }}>From</p>
                                    <p style={{
                                        color: DS.text.primary,
                                        fontWeight: 700,
                                        fontSize: DS.size.xl,
                                    }}>{proposal.boyName}</p>
                                </div>
                            </div>
                        </GlassCard>

                        {proposal.firstMeetingDate && (
                            <GlassCard padding="md" hover intensity={0.5}>
                                <div style={{ display: "flex", alignItems: "center", gap: DS.space.md }}>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: DS.radius.lg,
                                        background: DS.gradient.gold,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.4)",
                                    }}>
                                        <Calendar size={28} color={DS.colors.midnight} />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontSize: DS.size.xs,
                                            color: DS.text.muted,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.1em",
                                            fontWeight: 600,
                                            marginBottom: 2,
                                        }}>Since</p>
                                        <p style={{
                                            color: DS.text.primary,
                                            fontWeight: 700,
                                            fontSize: DS.size.base,
                                        }}>
                                            {new Date(proposal.firstMeetingDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                    </motion.div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
                    style={{ position: "relative" }}
                >
                    <GlassCard padding="sm" intensity={0.8} glow>
                        <div style={{
                            position: "relative",
                            borderRadius: DS.radius.xl,
                            overflow: "hidden",
                            aspectRatio: "3/4",
                        }}>
                            {proposal.heroImage ? (
                                <Image
                                    src={proposal.heroImage}
                                    alt="Our Love"
                                    fill
                                    priority
                                    style={{ objectFit: "cover" }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    background: DS.gradient.primary,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                }}>
                                    <motion.span
                                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{ fontSize: 120, marginBottom: DS.space.md }}
                                    >
                                        💑
                                    </motion.span>
                                    <p style={{ fontWeight: 600, fontSize: DS.size.xl }}>Your Photo Here</p>
                                </div>
                            )}

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: "absolute",
                                    bottom: 24,
                                    left: 24,
                                    right: 24,
                                    background: "rgba(15, 12, 41, 0.9)",
                                    backdropFilter: "blur(20px)",
                                    padding: `${DS.space.md} ${DS.space.lg}`,
                                    borderRadius: DS.radius.xl,
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: DS.space.sm }}>
                                    <Quote size={20} color={DS.colors.rose[400]} style={{ flexShrink: 0 }} />
                                    <p style={{
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: DS.size.base,
                                        fontStyle: "italic",
                                        margin: 0,
                                        lineHeight: 1.4,
                                    }}>
                                        {proposal.heroImageCaption || proposal.nickname || "My Everything 💕"}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.section>
    );
}

/* ─────────────────────────────────────────────
Final Proposal (Premium with Confetti)
───────────────────────────────────────────── */
function FinalQuestion({ proposal }: { proposal: ProposalData }) {
    const [isAnswered, setIsAnswered] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleYes = () => {
        setIsAnswered(true);
        setShowConfetti(true);

        const colors = [DS.colors.rose[500], DS.colors.purple[500], DS.colors.gold[400], "#22c55e", "#3b82f6"];
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement("div");
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 6 + Math.random() * 12;
            confetti.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                left: 50%;
                top: 50%;
                border-radius: ${Math.random() > 0.5 ? "50%" : "3px"};
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 20px ${color}80;
            `;
            document.body.appendChild(confetti);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 400 + Math.random() * 600;
            const rotation = Math.random() * 1080;

            confetti.animate([
                { transform: "translate(-50%, -50%) scale(0) rotate(0deg)", opacity: 1 },
                {
                    transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% - ${Math.sin(angle) * velocity}px)) scale(1) rotate(${rotation}deg)`,
                    opacity: 0
                }
            ], {
                duration: 2500 + Math.random() * 1000,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }).onfinish = () => confetti.remove();
        }
    };

      return (
        <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ marginTop: DS.space["3xl"] }}
        >
            <GlassCard padding="2xl" className="text-center relative overflow-hidden" variant="primary" glow>
                {/* Background Glow */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 800,
                    height: 800,
                    background: `radial-gradient(circle, ${DS.colors.rose[600]}20, transparent 70%)`,
                    pointerEvents: "none",
                }} />

                <motion.div
                    animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        marginBottom: DS.space.lg,
                        position: "relative",
                        zIndex: 10,
                        display: "inline-flex",
                        padding: DS.space.md,
                        background: DS.gradient.primary,
                        borderRadius: DS.radius["2xl"],
                        boxShadow: DS.shadow.glow,
                    }}
                >
                    <Heart size={48} fill="white" color="white" />
                </motion.div>

                <p style={{
                    fontSize: DS.size.sm,
                    color: DS.text.muted,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: DS.space.md,
                    fontWeight: 700,
                    position: "relative",
                    zIndex: 10,
                }}>
                    The Big Question
                </p>

                <h2 style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    lineHeight: 1.15,
                    marginBottom: DS.space.md,
                    color: DS.text.primary,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    position: "relative",
                    zIndex: 10,
                }}>
                    Will you make me the happiest
                    <br />
                    <span style={{
                        background: DS.gradient.roseGold,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        by saying Yes, {proposal.girlName}?
                    </span>
                </h2>

                <p style={{
                    color: DS.text.secondary,
                    marginBottom: DS.space.xl,
                    fontSize: DS.size.lg,
                    fontStyle: "italic",
                    position: "relative",
                    zIndex: 10,
                }}>
                    Forever yours, {proposal.boyName} 💕
                </p>

                <AnimatePresence mode="wait">
                    {!isAnswered ? (
                        <motion.div
                            key="buttons"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                display: "flex",
                                gap: DS.space.md,
                                justifyContent: "center",
                                flexWrap: "wrap",
                                position: "relative",
                                zIndex: 10,
                            }}
                        >
                            <Button
                                onClick={handleYes}
                                size="lg"
                                icon={Heart}
                            >
                                Yes, Forever!
                            </Button>

                            <Button
                                variant="ghost"
                                size="lg"
                            >
                                Still Thinking...
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            style={{ position: "relative", zIndex: 10 }}
                        >
                            <div style={{ fontSize: "5rem", marginBottom: DS.space.md }}>🎉💍🎊</div>
                            <h3 style={{
                                fontSize: DS.size["5xl"],
                                background: DS.gradient.gold,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: DS.space.sm,
                                fontWeight: 800,
                            }}>
                                She Said YES!
                            </h3>
                            <p style={{
                                color: DS.text.secondary,
                                fontSize: DS.size.xl,
                                maxWidth: 500,
                                margin: "0 auto",
                                lineHeight: 1.6,
                            }}>
                                You've made all my dreams come true! This is the beginning of our forever. 💑✨
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.section>
    );
}

/* ─────────────────────────────────────────────
Main Component (Premium Layout)
───────────────────────────────────────────── */
export default function ProposalExperience({ proposal, template }: TemplateRendererProps) {
    const gallery: GalleryItem[] = proposal.gallery?.filter((item: any) => item.image?.trim()).slice(0, 6) || [];

    const daysTogether = proposal.firstMeetingDate
        ? Math.floor((Date.now() - new Date(proposal.firstMeetingDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <main style={{
            background: DS.colors.midnight,
            minHeight: "100vh",
            color: DS.text.primary,
            position: "relative",
            overflowX: "hidden",
        }}>
            <FloatingParticles />

            {/* Global Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
                
                :root {
                    --font-inter: 'Inter', system-ui, sans-serif;
                    --font-playfair: 'Playfair Display', Georgia, serif;
                }
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                ::-webkit-scrollbar { 
                    width: 10px; 
                }
                ::-webkit-scrollbar-track { 
                    background: ${DS.colors.midnightLight}; 
                }
                ::-webkit-scrollbar-thumb { 
                    background: linear-gradient(180deg, ${DS.colors.rose[600]}, ${DS.colors.purple[600]}); 
                    border-radius: 5px; 
                }
                ::-webkit-scrollbar-thumb:hover { 
                    background: ${DS.colors.rose[500]}; 
                }
                
                html { scroll-behavior: smooth; }
                
                .font-display { font-family: 'Playfair Display', serif; }
                .font-body { font-family: 'Inter', sans-serif; }
            `}</style>

            <div style={{
                maxWidth: 1280,
                margin: "0 auto",
                padding: `${DS.space.lg} ${DS.space.lg} ${DS.space["3xl"]}`,
                position: "relative",
                zIndex: 10,
            }}>

                {/* Navigation */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: DS.space.xl,
                        padding: `${DS.space.md} 0`,
                    }}
                >
                    <Link href="/dashboard" style={{
                        textDecoration: "none",
                        color: DS.text.secondary,
                        fontSize: DS.size.sm,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        display: "flex",
                        alignItems: "center",
                        gap: DS.space.xs,
                        transition: "color 0.2s",
                    }}>
                        <motion.span whileHover={{ x: -4 }} style={{ display: "flex" }}>
                            <ArrowLeft size={18} />
                        </motion.span>
                        Back to Dashboard
                    </Link>

                    <GlassCard padding="sm" hover={false} variant="purple">
                        <div style={{ display: "flex", alignItems: "center", gap: DS.space.xs }}>
                            <Gem size={14} color={DS.colors.purple[400]} />
                            <span style={{
                                fontSize: DS.size.xs,
                                color: DS.colors.purple[300],
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            }}>
                                {template?.name || "Midnight Collection"}
                            </span>
                        </div>
                    </GlassCard>
                </motion.nav>

                {/* Hero Section */}
                <HeroSection proposal={proposal as ProposalData} />

                {/* Games Section */}
                <section style={{ margin: `${DS.space["3xl"]} 0` }}>
                    <SectionHeader
                        title="Love Games"
                        subtitle="Play these special games made just for us"
                        icon={Gamepad2}
                        variant="gold"
                    />

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: DS.space.lg,
                        maxWidth: "1200px",
                        margin: "0 auto",
                    }}>
                        <LoveQuiz proposal={proposal as ProposalData} />
                        <MemoryGame />
                        <LoveCalculator boyName={proposal.boyName} girlName={proposal.girlName} />
                    </div>
                </section>

                {/* Stats Bar */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: DS.space["3xl"] }}
                >
                    <GlassCard padding="xl" variant="purple" glow>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-around",
                            flexWrap: "wrap",
                            gap: DS.space.lg,
                        }}>
                            {[
                                { label: "Days Together", value: daysTogether, icon: Calendar, suffix: "", color: DS.colors.gold[400] },
                                { label: "Love Level", value: 100, icon: Heart, suffix: "%", color: DS.colors.rose[400] },
                                { label: "Happiness", value: "∞", icon: InfinityIcon, suffix: "", color: DS.colors.purple[400] },
                                { label: "Memories", value: gallery.length, icon: Camera, suffix: "", color: DS.colors.gold[400] },
                            ].map((stat, idx) => (
                                <div key={stat.label} style={{ textAlign: "center" }}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        whileInView={{ scale: 1, rotate: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: DS.radius.xl,
                                            background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)`,
                                            border: `2px solid ${stat.color}50`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto",
                                            marginBottom: DS.space.sm,
                                            boxShadow: `0 10px 30px -10px ${stat.color}40`,
                                        }}
                                    >
                                        <stat.icon size={36} color={stat.color} strokeWidth={2} />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 + 0.2 }}
                                        style={{
                                            fontSize: DS.size["4xl"],
                                            fontWeight: 800,
                                            color: stat.color,
                                            fontVariantNumeric: "tabular-nums",
                                            textShadow: `0 0 30px ${stat.color}50`,
                                        }}
                                    >
                                        {stat.value}{stat.suffix}
                                    </motion.div>
                                    <p style={{
                                        fontSize: DS.size.xs,
                                        color: DS.text.muted,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        marginTop: DS.space.xs,
                                        fontWeight: 600,
                                    }}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.section>

                {/* Story Section */}
                <section style={{ marginBottom: DS.space["3xl"] }}>
                    <SectionHeader
                        title="Our Love Story"
                        subtitle="The chapters of our beautiful journey"
                        icon={Sparkles}
                    />
                    <StorySection proposal={proposal as ProposalData} />
                </section>

                {/* Voice Note Section */}
                {proposal.voiceNote && (
                    <section style={{ marginBottom: DS.space["3xl"] }}>
                        <SectionHeader
                            title="A Special Message"
                            subtitle="Listen to my heart speaking to you"
                            icon={Mic}
                            variant="gold"
                        />
                        <div style={{ maxWidth: 600, margin: "0 auto" }}>
                            <VoiceNotePlayer voiceNote={proposal.voiceNote} />
                        </div>
                    </section>
                )}

                {/* Gallery Section */}
                {gallery.length > 0 && (
                    <section style={{ marginBottom: DS.space["3xl"] }}>
                        <SectionHeader
                            title="Our Memories"
                            subtitle="Moments captured in time"
                            icon={Camera}
                        />
                        <PhotoGallery gallery={gallery} />
                    </section>
                )}

                {/* Countdown Timer */}
                {proposal.firstMeetingDate && (
                    <section style={{ marginBottom: DS.space["3xl"] }}>
                        <div style={{ maxWidth: 700, margin: "0 auto" }}>
                            <CountdownTimer targetDate={proposal.firstMeetingDate} />
                        </div>
                    </section>
                )}

                {/* Final Question */}
                <FinalQuestion proposal={proposal as ProposalData} />

                {/* Footer */}
                <footer style={{
                    textAlign: "center",
                    paddingTop: DS.space["3xl"],
                    marginTop: DS.space["3xl"],
                    borderTop: `1px solid rgba(255,255,255,0.1)`,
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard padding="lg" className="inline-block mb-6" variant="purple">
                            <p style={{
                                fontSize: DS.size.sm,
                                color: DS.text.muted,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                gap: DS.space.xs,
                                fontWeight: 600,
                            }}>
                                Made with <Heart size={14} fill={DS.colors.rose[500]} color={DS.colors.rose[500]} /> for {proposal.girlName}
                            </p>
                        </GlassCard>
                        <p style={{
                            color: DS.text.muted,
                            fontStyle: "italic",
                            fontSize: DS.size.lg,
                            maxWidth: 600,
                            margin: "0 auto",
                            lineHeight: 1.7,
                        }}>
                            "In all the world, there is no heart for me like yours.
                            In all the world, there is no love for you like mine."
                        </p>
                        <p style={{
                            color: DS.text.secondary,
                            fontSize: DS.size.sm,
                            marginTop: DS.space.md,
                        }}>
                            © 2026 LoveDose • Crafted with passion
                        </p>
                    </motion.div>
                </footer>
            </div>
        </main>
    );
}
