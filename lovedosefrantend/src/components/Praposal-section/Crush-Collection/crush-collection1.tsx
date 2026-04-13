"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// Types
interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  occasion: string;
  notes: string;
  password: string;
}

interface GalleryImage {
  url?: string;
  image?: string;
  caption: string;
}

interface ProposalData {
  boyName: string;
  girlName: string;
  message: string;
  relationshipType: string;
  templateId: string;
  howWeMet: string;
  firstMeetingDate: string;
  nickname: string;
  whyILoveYou: string;
  futureDreams: string;
  heroImage: string;
  heroImageCaption: string;
  gallery: GalleryImage[];
  voiceNote: string;
  publishDurationId: string;
  publishDurationLabel: string;
  publishHours: number;
  publishPrice: number;
  allTemplateAccess: boolean;
  purchasedTemplateIds: string[];
  publishExpiresAt: string;
  customerDetails: CustomerDetails;
}

interface TemplateData {
  name: string;
}

interface CrushRomanticV2Props {
  proposal: ProposalData;
  template: TemplateData;
}

// Custom hook for mouse position (parallax effect)
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
}

export default function CrushRomanticV2({ proposal, template }: CrushRomanticV2Props) {
  const galleryImages = proposal.gallery?.filter((item) => (item.url || item.image || "").trim()) || [];
  const mousePosition = useMousePosition();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Game States
  const [activeGame, setActiveGame] = useState<string | null>(null);
  
  // Love Calculator
  const [calcName1, setCalcName1] = useState("");
  const [calcName2, setCalcName2] = useState("");
  const [lovePercentage, setLovePercentage] = useState(0);
  const [showCalcResult, setShowCalcResult] = useState(false);
  const [calcError, setCalcError] = useState("");
  
  // Memory Game
  const [memoryCards, setMemoryCards] = useState<Array<{id: number; emoji: string; flipped: boolean; matched: boolean}>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatches, setMemoryMatches] = useState(0);
  const [memoryGameWon, setMemoryGameWon] = useState(false);
  
  // Quiz
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Scratch
  const [scratched, setScratched] = useState(false);
  const [proposalResponse, setProposalResponse] = useState<"yes" | "think" | null>(null);
  
  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [relationshipDuration, setRelationshipDuration] = useState({ years: 0, months: 0, days: 0, hours: 0 });

  // Initialize Memory Game
  const initMemoryGame = useCallback(() => {
    const emojis = ['💎', '🌹', '🔮', '💫', '🦋', '✨'];
    const cards = [...emojis, ...emojis].map((emoji, index) => ({
      id: index, emoji, flipped: false, matched: false
    }));
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setMemoryCards(cards);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryMatches(0);
    setMemoryGameWon(false);
  }, []);

  useEffect(() => { initMemoryGame(); }, [initMemoryGame]);

  useEffect(() => {
    setCalcName1(proposal.boyName || "");
    setCalcName2(proposal.girlName || "");
  }, [proposal.boyName, proposal.girlName]);

  // Countdown Timer
  useEffect(() => {
    if (!proposal.publishExpiresAt) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(proposal.publishExpiresAt).getTime();
      const distance = expires - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [proposal.publishExpiresAt]);

  useEffect(() => {
    if (!proposal.firstMeetingDate) return;

    const updateRelationshipDuration = () => {
      const start = new Date(proposal.firstMeetingDate);
      if (Number.isNaN(start.getTime())) return;

      const now = new Date();
      const totalMs = now.getTime() - start.getTime();
      if (totalMs <= 0) {
        setRelationshipDuration({ years: 0, months: 0, days: 0, hours: 0 });
        return;
      }

      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonth;
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setRelationshipDuration({ years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), hours });
    };

    updateRelationshipDuration();
    const interval = setInterval(updateRelationshipDuration, 1000 * 60);
    return () => clearInterval(interval);
  }, [proposal.firstMeetingDate]);

  // Audio Progress
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const interval = setInterval(() => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Love Calculator
  const calculateLove = () => {
    if (!calcName1.trim() || !calcName2.trim()) {
      setCalcError("Please enter both names first.");
      setShowCalcResult(false);
      return;
    }

    setCalcError("");
    let score = 0;
    const combined = (calcName1.trim() + calcName2.trim()).toLowerCase();
    for (let char of combined) score += char.charCodeAt(0);
    score = (score % 30) + 70;
    if (calcName1.trim().toLowerCase().includes(calcName2.trim().toLowerCase()) || 
        calcName2.trim().toLowerCase().includes(calcName1.trim().toLowerCase())) score = 99;
    setLovePercentage(score);
    setShowCalcResult(true);
  };

  // Memory Game
  const flipCard = (index: number) => {
    if (flippedIndices.length === 2 || memoryCards[index].flipped || memoryCards[index].matched) return;
    const newCards = [...memoryCards];
    newCards[index].flipped = true;
    setMemoryCards(newCards);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (memoryCards[first].emoji === memoryCards[second].emoji) {
        setTimeout(() => {
          const matched = [...memoryCards];
          matched[first].matched = true;
          matched[second].matched = true;
          setMemoryCards(matched);
          setFlippedIndices([]);
          setMemoryMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === 6) setMemoryGameWon(true);
            return newMatches;
          });
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...memoryCards];
          reset[first].flipped = false;
          reset[second].flipped = false;
          setMemoryCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Quiz Data
  const quizQuestions = [
    {
      question: `When did ${proposal.boyName} first meet ${proposal.girlName}?`,
      options: [proposal.firstMeetingDate, "Last week", "In school", "At work"],
      correct: 0
    },
    {
      question: `What does ${proposal.boyName} call ${proposal.girlName} affectionately?`,
      options: [proposal.nickname, "Friend", "Buddy", "Mate"],
      correct: 0
    },
    {
      question: "What makes your love story special?",
      options: ["It's magical", "It's ordinary", "It's complicated", "It's simple"],
      correct: 0
    }
  ];

  const handleQuizAnswer = (index: number) => {
    if (index === quizQuestions[quizStep].correct) setQuizScore(s => s + 1);
    if (quizStep < quizQuestions.length - 1) setQuizStep(s => s + 1);
    else setQuizComplete(true);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-rose-500 selection:text-white font-sans">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(236, 72, 153, 0.3), transparent 50%)`
          }}
        />
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) 
            }}
            animate={{ 
              y: [null, -20, 20],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Glass Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            {template?.name || "Our Story"} ✨
          </motion.span>
          <Link 
            href="/dashboard" 
            className="group relative px-6 py-2 overflow-hidden rounded-full border border-white/20 text-sm font-medium transition-all hover:border-rose-500/50"
          >
            <span className="relative z-10 group-hover:text-rose-400 transition-colors">Dashboard</span>
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Hero Section - Cinematic */}
        <motion.section 
          className="relative rounded-[3rem] overflow-hidden mb-32 min-h-[85vh] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Background with parallax */}
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{ 
                backgroundImage: proposal.heroImage 
                  ? `url(${proposal.heroImage})` 
                  : 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)' 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/80" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-medium tracking-wider uppercase text-rose-300">
                {proposal.boyName} & {proposal.girlName}
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                FOREVER
              </span>
              <br />
              <span className="text-4xl md:text-6xl lg:text-7xl font-light text-white/90 italic">
                Begins Here
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {proposal.heroImageCaption || "Every love story is beautiful, but ours is my favorite"}
            </motion.p>

            <motion.button
              className="group relative px-10 py-5 bg-gradient-to-r from-rose-600 to-purple-600 rounded-full font-bold text-lg overflow-hidden shadow-2xl shadow-rose-500/25"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="relative z-10 flex items-center gap-2">
                Begin Our Journey 
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ↓
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </motion.section>

        {/* Story Section - Glass Cards */}
        <motion.section 
          id="story" 
          className="mb-32"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center mb-20">
            <motion.span 
              className="inline-block px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium tracking-wider uppercase mb-4 border border-purple-500/30"
              variants={itemVariants}
            >
              Our Journey
            </motion.span>
            <motion.h2 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-rose-200 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Chapters of Us
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "How We Met", 
                content: proposal.howWeMet,
                icon: "💫",
                date: proposal.firstMeetingDate,
                gradient: "from-purple-600 to-indigo-600",
                border: "border-purple-500/30"
              },
              { 
                title: "What I Adore", 
                content: proposal.whyILoveYou,
                icon: "🌹",
                badge: proposal.nickname,
                gradient: "from-rose-600 to-pink-600",
                border: "border-rose-500/30"
              },
              { 
                title: "Forever Dreams", 
                content: proposal.futureDreams,
                icon: "🔮",
                gradient: "from-amber-600 to-orange-600",
                border: "border-amber-500/30"
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative group p-8 rounded-3xl bg-white/5 backdrop-blur-xl border ${card.border} overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  
                  {card.date && (
                    <div className="text-xs font-bold text-purple-400 mb-3 tracking-widest uppercase">
                      {new Date(card.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                  
                  {card.badge && (
                    <div className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-4 border border-rose-500/30">
                      {card.badge}
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
                    {card.title}
                  </h3>
                  
                  <p className="text-white/60 leading-relaxed font-light">
                    {card.content || [
                      "Destiny brought us together in the most unexpected way...",
                      "In your eyes, I found my home...",
                      "Hand in hand, we'll conquer every dream..."
                    ][index]}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Relationship Timer - Neon Style */}
        {proposal.firstMeetingDate && (
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-[3rem] p-12 md:p-16 bg-gradient-to-br from-purple-900/50 to-rose-900/50 backdrop-blur-2xl border border-white/10 overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
              
              <div className="relative z-10 text-center">
                <span className="text-rose-400 text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Together Since</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
                  {new Date(proposal.firstMeetingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { value: relationshipDuration.years, label: 'Years', color: 'from-purple-600 to-indigo-600' },
                    { value: relationshipDuration.months, label: 'Months', color: 'from-rose-600 to-pink-600' },
                    { value: relationshipDuration.days, label: 'Days', color: 'from-amber-600 to-orange-600' },
                    { value: relationshipDuration.hours, label: 'Hours', color: 'from-emerald-600 to-teal-600' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={item.label}
                      className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.color} shadow-2xl`}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-4xl md:text-5xl font-black text-white mb-2">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs font-bold text-white/80 uppercase tracking-widest">
                        {item.label}
                      </div>
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Gallery - Masonry with Hover Effects */}
        <motion.section 
          className="mb-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium tracking-wider uppercase mb-4 border border-indigo-500/30">
              Memories
            </span>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Our Gallery
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {galleryImages.length > 0 ? galleryImages.map((image, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer ${index === 0 || index === 3 ? 'md:col-span-2 md:row-span-2' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={image.url || image.image || ""} 
                  alt={image.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <p className="text-white font-medium text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    {image.caption}
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl transition-colors duration-300" />
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center text-white/40 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-xl">Beautiful memories will appear here</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Gaming Zone - Cyberpunk Style */}
        <section id="games" className="mb-32">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-rose-500/20 text-rose-300 text-sm font-medium tracking-wider uppercase mb-4 border border-rose-500/30">
              Interactive Fun
            </span>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Love Games
            </h2>
            <p className="text-white/50 text-lg">Play, laugh, and create memories together</p>
          </motion.div>

          {/* Game Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { id: 'quiz', icon: '🎯', title: 'Love Quiz', desc: 'Test your knowledge', gradient: 'from-purple-600 to-indigo-600', shadow: 'shadow-purple-500/25' },
              { id: 'memory', icon: '🧩', title: 'Memory Match', desc: 'Find the pairs', gradient: 'from-rose-600 to-pink-600', shadow: 'shadow-rose-500/25' },
              { id: 'calculator', icon: '💕', title: 'Love Meter', desc: 'Calculate destiny', gradient: 'from-amber-600 to-orange-600', shadow: 'shadow-amber-500/25' },
              { id: 'scratch', icon: '🎁', title: 'Surprise', desc: 'Reveal the message', gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/25' }
            ].map((game) => (
              <motion.div
                key={game.id}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${game.gradient} cursor-pointer overflow-hidden ${game.shadow} shadow-2xl`}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGame(game.id)}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4 transform hover:scale-110 transition-transform">{game.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{game.title}</h3>
                  <p className="text-white/80 text-sm">{game.desc}</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </motion.div>
            ))}
          </div>

          {/* Active Game Area */}
          <AnimatePresence mode="wait">
            {activeGame && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="relative rounded-[2.5rem] p-8 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-rose-900/20" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {activeGame === 'quiz' && 'Love Quiz Challenge'}
                      {activeGame === 'memory' && 'Memory Match Game'}
                      {activeGame === 'calculator' && 'Destiny Calculator'}
                      {activeGame === 'scratch' && 'Hidden Message'}
                    </h3>
                    <motion.button 
                      onClick={() => setActiveGame(null)}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
                      whileHover={{ rotate: 90 }}
                    >
                      ×
                    </motion.button>
                  </div>

                  {/* Quiz Game */}
                  {activeGame === 'quiz' && (
                    <div className="max-w-2xl mx-auto">
                      {!quizComplete ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                            <span className="px-4 py-2 rounded-full bg-white/10">Question {quizStep + 1} of {quizQuestions.length}</span>
                            <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300">Score: {quizScore}</span>
                          </div>
                          
                          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-purple-500 to-rose-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                            />
                          </div>

                          <h4 className="text-2xl font-medium text-white mb-6">{quizQuestions[quizStep].question}</h4>
                          
                          <div className="grid gap-4">
                            {quizQuestions[quizStep].options.map((option, idx) => (
                              <motion.button
                                key={idx}
                                className="w-full p-5 text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                                whileHover={{ x: 10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleQuizAnswer(idx)}
                              >
                                <span className="inline-block w-8 h-8 rounded-full bg-white/10 text-center leading-8 mr-4 text-sm group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-white/90">{option}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <motion.div 
                            className="text-7xl mb-6"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            🏆
                          </motion.div>
                          <h4 className="text-3xl font-bold mb-4 text-white">Quiz Complete!</h4>
                          <p className="text-2xl bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent font-bold mb-8">
                            You scored {quizScore} out of {quizQuestions.length}
                          </p>
                          <button 
                            onClick={() => { setQuizStep(0); setQuizScore(0); setQuizComplete(false); }}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full font-bold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                          >
                            Play Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Memory Game */}
                  {activeGame === 'memory' && (
                    <div className="max-w-lg mx-auto">
                      {memoryGameWon && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30"
                        >
                          <div className="text-4xl mb-2">🎉</div>
                          <p className="text-rose-300 font-bold text-lg">Amazing! You found all pairs!</p>
                        </motion.div>
                      )}
                      
                      <div className="flex justify-between mb-6 text-white/60 font-medium">
                        <span className="px-4 py-2 rounded-full bg-white/10">Moves: {memoryMoves}</span>
                        <span className="px-4 py-2 rounded-full bg-white/10">Matches: {memoryMatches}/6</span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {memoryCards.map((card, index) => (
                          <motion.div
                            key={card.id}
                            className={`aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${
                              card.matched 
                                ? 'bg-gradient-to-br from-rose-500/30 to-purple-500/30 border-2 border-rose-400/50' 
                                : card.flipped 
                                  ? 'bg-white/20 border-2 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30 hover:bg-white/10'
                            }`}
                            whileHover={!card.flipped && !card.matched ? { scale: 1.1, rotateY: 10 } : {}}
                            whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : {}}
                            onClick={() => flipCard(index)}
                          >
                            <AnimatePresence>
                              {(card.flipped || card.matched) && (
                                <motion.span
                                  initial={{ opacity: 0, rotateY: 180 }}
                                  animate={{ opacity: 1, rotateY: 0 }}
                                  exit={{ opacity: 0 }}
                                >
                                  {card.emoji}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>

                      <button 
                        onClick={initMemoryGame}
                        className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all font-medium text-white"
                      >
                        New Game
                      </button>
                    </div>
                  )}

                  {/* Love Calculator */}
                  {activeGame === 'calculator' && (
                    <div className="max-w-md mx-auto">
                      <div className="space-y-4 mb-8">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={proposal.boyName || "Your Name"}
                            value={calcName1}
                            onChange={(e) => setCalcName1(e.target.value)}
                            className="w-full p-5 bg-white/5 border border-white/20 rounded-2xl focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-white placeholder-white/40 text-lg"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400">💝</div>
                        </div>
                        
                        <div className="text-center text-3xl text-rose-400 animate-pulse">✦</div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={proposal.girlName || "Partner's Name"}
                            value={calcName2}
                            onChange={(e) => setCalcName2(e.target.value)}
                            className="w-full p-5 bg-white/5 border border-white/20 rounded-2xl focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-white placeholder-white/40 text-lg"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400">💝</div>
                        </div>
                      </div>

                      <motion.button
                        className="w-full py-5 bg-gradient-to-r from-rose-600 to-purple-600 rounded-2xl font-bold text-lg text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={calculateLove}
                      >
                        Calculate Our Connection
                      </motion.button>

                      {calcError && (
                        <p className="mt-4 text-center text-rose-400 font-medium">{calcError}</p>
                      )}

                      <AnimatePresence>
                        {showCalcResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="mt-10 text-center p-8 rounded-3xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30"
                          >
                            <div className="text-7xl font-black bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                              {lovePercentage}%
                            </div>
                            <p className="text-xl text-white/80 mb-2">
                              {lovePercentage >= 90 ? "Perfect Soulmates ✨" : 
                               lovePercentage >= 80 ? "Beautiful Connection 💫" : 
                               "Growing Together 🌱"}
                            </p>
                            <p className="text-white/50">{calcName1} + {calcName2}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Scratch Card */}
                  {activeGame === 'scratch' && (
                    <div className="max-w-md mx-auto text-center">
                      <div className="relative w-80 h-56 mx-auto rounded-3xl overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center p-8 border border-white/20">
                          <p className="text-xl text-white/90 font-medium italic leading-relaxed">
                            "{proposal.message || "You are my today and all of my tomorrows."}"
                          </p>
                        </div>
                        
                        <AnimatePresence>
                          {!scratched && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center cursor-pointer"
                              onClick={() => setScratched(true)}
                            >
                              <motion.div 
                                className="text-5xl mb-3"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              >
                                🎁
                              </motion.div>
                              <p className="text-white font-bold text-lg">Click to Reveal</p>
                              <p className="text-white/50 text-sm mt-2">A special message awaits</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {scratched && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-8 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white/80 text-sm"
                          onClick={() => setScratched(false)}
                        >
                          Hide Again
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Voice Note - Modern Player */}
        {proposal.voiceNote && (
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="max-w-3xl mx-auto rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-purple-900/30 to-rose-900/30 backdrop-blur-2xl border border-white/10">
              <div className="flex items-center gap-8">
                <motion.button
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-2xl ${
                    isPlaying 
                      ? 'bg-rose-500 text-white shadow-rose-500/50' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleAudio}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </motion.button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium text-lg">A Message For You</p>
                    <span className="text-white/40 text-sm">{isPlaying ? 'Playing...' : 'Paused'}</span>
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                    <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
                  </div>
                </div>
              </div>
              <audio ref={audioRef} src={proposal.voiceNote} onEnded={() => setIsPlaying(false)} />
            </div>
          </motion.section>
        )}

        {/* Special Message - Typography Focus */}
        <motion.section 
          className="mb-32 py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div 
              className="absolute -top-10 left-1/2 -translate-x-1/2 text-8xl text-rose-500/20"
              animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              "
            </motion.div>
            
            <p className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-12 italic">
              {proposal.message}
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose-500" />
              <span className="text-rose-400 font-bold tracking-widest uppercase text-sm">
                {proposal.boyName}
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose-500" />
            </div>
          </div>
        </motion.section>

        {/* Countdown - Neon Style */}
        {proposal.publishExpiresAt && (
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-[3rem] p-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-2xl border border-white/10 text-center">
              <p className="text-white/50 text-sm font-bold tracking-[0.3em] uppercase mb-8">
                {proposal.publishDurationLabel || "Special Moment"} Remaining
              </p>
              
              <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className="text-4xl md:text-6xl font-black text-white mb-2 tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs md:text-sm text-white/40 uppercase tracking-widest font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Final Proposal - Dramatic */}
        <motion.section
          className="text-center mb-32 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 bg-gradient-to-br from-rose-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-3xl border border-white/10 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: [-50, -400],
                    x: [0, Math.random() * 100 - 50]
                  }}
                  transition={{ 
                    duration: 4,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{ left: `${15 + i * 15}%`, bottom: 0 }}
                >
                  {['💖', '💕', '💗', '💓', '💝', '💘'][i]}
                </motion.div>
              ))}
            </div>

            <div className="relative z-10">
              <motion.div 
                className="text-6xl mb-8 inline-block"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                💍
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                Will You Be Mine
                <br />
                <span className="text-4xl md:text-5xl font-light text-white/80 italic">
                  For Eternity?
                </span>
              </h2>

              <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                {proposal.girlName}, will you make me the happiest person alive and be my{' '}
                <span className="text-rose-400 font-bold">
                  {proposal.relationshipType || "partner"}
                </span>?
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button
                  className="group relative px-12 py-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 rounded-full font-bold text-xl text-white overflow-hidden shadow-2xl shadow-rose-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProposalResponse("yes")}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Yes, Forever 💖
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button
                  className="px-12 py-6 rounded-full font-bold text-xl border-2 border-white/20 text-white/70 hover:border-rose-500/50 hover:text-rose-400 transition-all"
                  whileHover={{ x: [0, -5, 5, -5, 0] }}
                  onClick={() => setProposalResponse("think")}
                >
                  Let Me Think 🤔
                </motion.button>
              </div>

              <AnimatePresence>
                {proposalResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mt-10 rounded-3xl p-8 ${
                      proposalResponse === "yes"
                        ? 'bg-gradient-to-r from-rose-500/30 to-purple-500/30 border-2 border-rose-500/50'
                        : 'bg-white/5 border-2 border-white/20'
                    }`}
                  >
                    {proposalResponse === "yes" ? (
                      <div className="space-y-3">
                        <motion.div 
                          className="text-5xl mb-4"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: 3, duration: 0.3 }}
                        >
                          🎉💍🎉
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white">She Said YES!</h3>
                        <p className="text-rose-200 text-lg">
                          {proposal.girlName} just made this the happiest moment of my life!
                          <br />
                          Our forever starts now ✨
                        </p>
                      </div>
                    ) : (
                      <div className="text-xl text-white/80">
                        Take your time... but remember, my heart is already yours 💝
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center pb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm">
            <span className="text-rose-500">✦</span>
            <span>Crafted with love for {proposal.girlName}</span>
            <span className="text-rose-500">✦</span>
          </div>
          <p className="mt-4 text-white/20 text-xs">
            {template?.name} • {proposal.templateId}
          </p>
        </footer>
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

// Helper function for formatting time
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
