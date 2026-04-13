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

interface CrushGenZProps {
  proposal: ProposalData;
  template: TemplateData;
}

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return displayText;
};

export default function CrushGenZ({ proposal, template }: CrushGenZProps) {
  const galleryImages = proposal.gallery?.filter((item) => (item.url || item.image || "").trim()) || [];

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Game States
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGames, setShowGames] = useState(false);

  // Love Calculator
  const [calcName1, setCalcName1] = useState("");
  const [calcName2, setCalcName2] = useState("");
  const [lovePercentage, setLovePercentage] = useState(0);
  const [showCalcResult, setShowCalcResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState("");

  // Memory Game
  const [memoryCards, setMemoryCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatches, setMemoryMatches] = useState(0);
  const [memoryGameWon, setMemoryGameWon] = useState(false);

  // Quiz
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Scratch
  const [scratched, setScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Gallery modal
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [proposalResponse, setProposalResponse] = useState<"yes" | "think" | null>(null);

  // Typewriter for hero
  const heroText = useTypewriter(`Hey ${proposal.girlName}... this is for you 💖`, 80);

  // Initialize Memory Game
  const initMemoryGame = useCallback(() => {
    const emojis = ['💖', '✨', '🌙', '💫', '🦋', '💎'];
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

  // Love Calculator with animation
  const calculateLove = async () => {
    if (!calcName1.trim() || !calcName2.trim()) {
      setCalcError("Please enter both names first.");
      setShowCalcResult(false);
      return;
    }

    setCalcError("");
    setIsCalculating(true);
    setShowCalcResult(false);

    // Animate numbers
    let current = 0;
    const combined = (calcName1.trim() + calcName2.trim()).toLowerCase();
    let target = 0;
    for (const char of combined) target += char.charCodeAt(0);
    target = (target % 30) + 70;
    if (
      calcName1.trim().toLowerCase().includes(calcName2.trim().toLowerCase()) ||
      calcName2.trim().toLowerCase().includes(calcName1.trim().toLowerCase())
    ) {
      target = 99;
    }
    const interval = setInterval(() => {
      current += 2;
      setLovePercentage(current);
      if (current >= target) {
        clearInterval(interval);
        setLovePercentage(target);
        setIsCalculating(false);
        setShowCalcResult(true);
      }
    }, 50);
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
      question: `When did ${proposal.boyName} first meet ${proposal.girlName}? 💫`,
      options: [proposal.firstMeetingDate, "Last week", "In school", "At a party"],
      correct: 0
    },
    {
      question: `What's ${proposal.boyName}'s special nickname for ${proposal.girlName}? 💖`,
      options: [proposal.nickname, "Babe", "Honey", "Friend"],
      correct: 0
    },
    {
      question: "What makes their love story special? ✨",
      options: ["It's written in the stars", "It's ordinary", "It's complicated", "It's simple"],
      correct: 0
    }
  ];

  const handleQuizAnswer = (index: number) => {
    setSelectedOption(index);
    setTimeout(() => {
      if (index === quizQuestions[quizStep].correct) {
        setQuizScore(s => s + 1);
      }
      if (quizStep < quizQuestions.length - 1) {
        setQuizStep(s => s + 1);
        setSelectedOption(null);
      } else {
        setQuizComplete(true);
      }
    }, 500);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Scratch handler
  const handleScratch = () => {
    setScratchProgress(prev => {
      const newProgress = prev + 20;
      if (newProgress >= 100) setScratched(true);
      return newProgress;
    });
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/40 via-purple-900/40 to-pink-900/40 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.3),transparent_70%)]" />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg"
            initial={{
              y: "100vh",
              x: Math.random() * 100 + "%",
              opacity: 0
            }}
            animate={{
              y: "-10vh",
              opacity: [0, 1, 1, 0],
              rotate: Math.random() * 360
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            {['💖', '✨', '💫', '🌟', '💕', '♥️', '🔥', '💎'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-pink-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.span
            className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            🔥 {template?.name || "Crush Vibes"}
          </motion.span>
          <Link
            href="/dashboard"
            className="text-sm text-pink-300 hover:text-white transition-colors uppercase tracking-widest font-semibold"
          >
            Dashboard →
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section - Full Screen Trending Style */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center z-10"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Glowing orb behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/30 rounded-full blur-[100px] animate-pulse" />

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                {heroText}
              </span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1 h-16 bg-pink-400 ml-2"
              />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 font-light"
          >
            {proposal.heroImageCaption || "A story written in the stars ✨"}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 40px rgba(236,72,153,0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowGames(true);
              document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative group px-10 py-5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full font-bold text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Tap to Start 💫
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-pink-400 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-pink-400 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Story Section - Scroll Story Format */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-pink-400 text-sm font-bold tracking-[0.3em] uppercase">Our Journey</span>
            <h2 className="text-4xl md:text-6xl font-black mt-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              The Story of Us 💖
            </h2>
          </motion.div>

          {/* Story Cards with scroll reveal */}
          <div className="space-y-32">
            {/* How We Met */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-pink-500/20">
                  <div className="text-5xl mb-4">💫</div>
                  <h3 className="text-3xl font-bold mb-4 text-pink-300">How We Met</h3>
                  {proposal.firstMeetingDate && (
                    <div className="inline-block bg-pink-500/20 text-pink-300 px-4 py-1 rounded-full text-sm mb-4 font-semibold">
                      📅 {new Date(proposal.firstMeetingDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {proposal.howWeMet || "Some connections feel written in the stars... ✨"}
                  </p>
                </div>
              </div>
              <div className="relative h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                  💫
                </div>
              </div>
            </motion.div>

            {/* Why I Like You */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="relative h-80 md:h-96 order-2 md:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                  💖
                </div>
              </div>
              <div className="relative group order-1 md:order-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-rose-500/20">
                  <div className="text-5xl mb-4">💖</div>
                  <h3 className="text-3xl font-bold mb-4 text-rose-300">Why I Like You</h3>
                  {proposal.nickname && (
                    <div className="inline-block bg-rose-500/20 text-rose-300 px-4 py-1 rounded-full text-sm mb-4 font-semibold">
                      💝 {proposal.nickname}
                    </div>
                  )}
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {proposal.whyILoveYou || "It's the way you laugh, the way you care... 💕"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Future Dreams */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-3xl font-bold mb-4 text-purple-300">Our Future</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {proposal.futureDreams || "I imagine countless sunsets together... 🌅"}
                  </p>
                </div>
              </div>
              <div className="relative h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                  ✨
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Instagram Style */}
      <section className="relative z-10 py-20 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-fuchsia-400 text-sm font-bold tracking-[0.3em] uppercase">Memories</span>
            <h2 className="text-4xl md:text-6xl font-black mt-4 bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Our Gallery 📸
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {galleryImages.length > 0 ? galleryImages.map((image, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${index === 0 || index === 3 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url || image.image || ""}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <p className="text-white font-medium text-sm">{image.caption}</p>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">⛶</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center text-gray-500">
                <div className="text-6xl mb-4">📸</div>
                <p>Beautiful moments will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url || selectedImage.image || ""}
                alt={selectedImage.caption}
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <p className="text-center text-white mt-4 text-lg">{selectedImage.caption}</p>
              <button
                className="absolute -top-12 right-0 text-white text-2xl hover:text-pink-400 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gaming Zone */}
      <section id="games" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-pink-400 text-sm font-bold tracking-[0.3em] uppercase">Play Zone</span>
            <h2 className="text-4xl md:text-6xl font-black mt-4 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Love Games 🎮
            </h2>
            <p className="text-gray-400 mt-4 text-lg">Play these mini-games to unlock our love story! 🔥</p>
          </motion.div>

          {/* Game Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { id: 'quiz', icon: '❓', title: 'Love Quiz', desc: 'Test your knowledge', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/50' },
              { id: 'memory', icon: '🧠', title: 'Memory Flip', desc: 'Match the pairs', color: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-500/50' },
              { id: 'calculator', icon: '🔢', title: 'Love Calc', desc: 'Calculate us', color: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-500/50' },
              { id: 'scratch', icon: '🎁', title: 'Scratch Card', desc: 'Reveal secret', color: 'from-orange-500 to-pink-500', shadow: 'shadow-orange-500/50' }
            ].map((game) => (
              <motion.div
                key={game.id}
                className="relative group cursor-pointer"
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setActiveGame(game.id)}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${game.color} rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 ${game.shadow}`} />
                <div className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 h-full">
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{game.title}</h3>
                  <p className="text-gray-400 text-sm">{game.desc}</p>
                  <div className="mt-4 flex items-center text-xs text-pink-400 font-semibold">
                    PLAY NOW <span className="ml-1">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Game Area */}
          <AnimatePresence mode="wait">
            {activeGame && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-pink-500/30 shadow-2xl shadow-pink-500/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {activeGame === 'quiz' && '❓ Love Quiz Challenge'}
                    {activeGame === 'memory' && '🧠 Memory Match Game'}
                    {activeGame === 'calculator' && '🔢 Love Calculator'}
                    {activeGame === 'scratch' && '🎁 Secret Message'}
                  </h3>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Quiz Game */}
                {activeGame === 'quiz' && (
                  <div className="max-w-2xl mx-auto">
                    {!quizComplete ? (
                      <div>
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Question {quizStep + 1}/{quizQuestions.length}</span>
                            <span className="text-pink-400 font-bold">Score: {quizScore}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        <h4 className="text-2xl mb-6 text-white font-semibold">{quizQuestions[quizStep].question}</h4>

                        <div className="grid gap-3">
                          {quizQuestions[quizStep].options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium ${selectedOption === idx
                                  ? idx === quizQuestions[quizStep].correct
                                    ? 'bg-green-500/20 border-green-500 text-green-300'
                                    : 'bg-red-500/20 border-red-500 text-red-300'
                                  : 'bg-white/5 border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10'
                                }`}
                              whileHover={{ scale: 1.02, x: 10 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuizAnswer(idx)}
                              disabled={selectedOption !== null}
                            >
                              {option}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="text-8xl mb-4"
                        >
                          🏆
                        </motion.div>
                        <h4 className="text-3xl font-bold mb-2 text-white">Quiz Complete! 🎉</h4>
                        <p className="text-xl text-pink-400 mb-6">You scored {quizScore} out of {quizQuestions.length}</p>
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() => { setQuizStep(0); setQuizScore(0); setQuizComplete(false); setSelectedOption(null); }}
                            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-full font-semibold transition-colors"
                          >
                            Play Again 🔄
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Memory Game */}
                {activeGame === 'memory' && (
                  <div className="max-w-lg mx-auto">
                    {memoryGameWon && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30"
                      >
                        <div className="text-4xl mb-2">🎊</div>
                        <p className="text-green-300 font-bold text-lg">Amazing! You found all pairs! 💕</p>
                      </motion.div>
                    )}

                    <div className="flex justify-between mb-6 text-sm">
                      <span className="text-gray-400">Moves: <span className="text-white font-bold">{memoryMoves}</span></span>
                      <span className="text-pink-400">Matches: <span className="text-white font-bold">{memoryMatches}/6</span></span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {memoryCards.map((card, index) => (
                        <motion.div
                          key={card.id}
                          className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-all ${card.matched
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                              : card.flipped
                                ? 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-pink-500/30'
                                : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
                            }`}
                          whileHover={!card.flipped && !card.matched ? { scale: 1.1, rotateY: 10 } : {}}
                          whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : {}}
                          onClick={() => flipCard(index)}
                          animate={card.flipped || card.matched ? { rotateY: 180 } : { rotateY: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span style={{ transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'none' }}>
                            {card.flipped || card.matched ? card.emoji : '?'}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={initMemoryGame}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                      🔄 New Game
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
                          onKeyDown={(e) => { if (e.key === "Enter") calculateLove(); }}
                          className="w-full p-4 bg-white/5 border-2 border-pink-500/30 rounded-xl focus:outline-none focus:border-pink-500 text-white placeholder-gray-500 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">👤</span>
                      </div>

                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-3xl"
                        >
                          💕
                        </motion.div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder={proposal.girlName || "Partner's Name"}
                          value={calcName2}
                          onChange={(e) => setCalcName2(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") calculateLove(); }}
                          className="w-full p-4 bg-white/5 border-2 border-pink-500/30 rounded-xl focus:outline-none focus:border-pink-500 text-white placeholder-gray-500 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">💝</span>
                      </div>
                    </div>

                    <motion.button
                      className="w-full py-4 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/30 disabled:opacity-50"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(236,72,153,0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={calculateLove}
                      disabled={isCalculating}
                    >
                      {isCalculating ? 'Calculating...' : 'Calculate Love % 💘'}
                    </motion.button>

                    {calcError && (
                      <p className="mt-3 text-center text-sm text-pink-400">{calcError}</p>
                    )}
                    <AnimatePresence>
                      {showCalcResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="mt-8 text-center"
                        >
                          <div className="relative inline-block">
                            <motion.div
                              className="text-7xl font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              {lovePercentage}%
                            </motion.div>
                            <motion.div
                              className="absolute -inset-4 bg-pink-500/20 rounded-full blur-xl"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          </div>
                          <motion.p
                            className="text-xl text-pink-300 mt-4 font-semibold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {lovePercentage >= 90 ? "Soulmates! 🔥💕" :
                              lovePercentage >= 80 ? "Perfect Match! ✨" :
                                "Beautiful Connection! 💫"}
                          </motion.p>
                          <p className="mt-3 text-sm text-gray-400">{calcName1} + {calcName2}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Scratch Card */}
                {activeGame === 'scratch' && (
                  <div className="max-w-md mx-auto text-center">
                    <p className="text-gray-400 mb-6">Scratch to reveal a secret message! 👆</p>
                    <div
                      className="relative w-80 h-48 mx-auto rounded-2xl overflow-hidden cursor-pointer select-none"
                      onClick={handleScratch}
                      onMouseMove={(e) => e.buttons === 1 && handleScratch()}
                    >
                      {/* Revealed content */}
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center p-6">
                        <p className="text-lg text-white font-medium italic leading-relaxed">
                          "{proposal.message || "You make my world brighter every single day!"}"
                        </p>
                      </div>

                      {/* Scratch overlay */}
                      <AnimatePresence>
                        {!scratched && (
                          <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 flex flex-col items-center justify-center"
                            style={{
                              clipPath: `polygon(0 0, ${scratchProgress}% 0, ${scratchProgress}% 100%, 0 100%)`,
                              opacity: 1 - (scratchProgress / 100)
                            }}
                          >
                            <div className="text-5xl mb-2">✨</div>
                            <p className="text-white font-bold">CLICK TO SCRATCH!</p>
                            <div className="w-32 h-2 bg-gray-300 rounded-full mt-4 overflow-hidden">
                              <div
                                className="h-full bg-pink-400 transition-all"
                                style={{ width: `${scratchProgress}%` }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {scratched && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
                        onClick={() => { setScratched(false); setScratchProgress(0); }}
                      >
                        🔄 Reset Card
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Voice Note Section - Reel Style */}
      {proposal.voiceNote && (
        <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="text-pink-400 text-sm font-bold tracking-[0.3em] uppercase">Voice Message</span>
              <h2 className="text-3xl md:text-5xl font-black mt-4 text-white">A Voice Note For You 🎤</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/20 shadow-2xl"
            >
              <div className="flex items-center gap-6">
                <motion.button
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${isPlaying
                      ? 'bg-pink-500 shadow-lg shadow-pink-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                    }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleAudio}
                >
                  {isPlaying ? '⏸' : '▶'}
                </motion.button>

                <div className="flex-1">
                  {/* Waveform visualization */}
                  <div className="flex items-center justify-center gap-1 h-12 mb-3">
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full"
                        animate={{
                          height: isPlaying
                            ? [10, Math.random() * 30 + 10, 10]
                            : 10
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.3,
                          delay: i * 0.02
                        }}
                        style={{ height: 10 }}
                      />
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{isPlaying ? 'Playing...' : 'Tap play'}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              <audio ref={audioRef} src={proposal.voiceNote} onEnded={() => setIsPlaying(false)} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Special Message Section - Emotional Hit */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-pink-600/10" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-8xl mb-8 animate-pulse">💌</div>

            <motion.h2
              className="text-4xl md:text-6xl font-black mb-8 leading-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                Words From My Heart
              </span>
            </motion.h2>

            <motion.p
              className="text-2xl md:text-3xl text-gray-200 leading-relaxed font-light italic"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              "{proposal.message}"
            </motion.p>

            <motion.div
              className="mt-8 flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-pink-400" />
              <span className="text-pink-400 font-semibold tracking-widest uppercase text-sm">
                {proposal.boyName}
              </span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-pink-400" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Timer - Trending Feature */}
      {proposal.publishExpiresAt && (
        <section className="relative z-10 py-20 px-4 bg-black/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="text-fuchsia-400 text-sm font-bold tracking-[0.3em] uppercase">⏳ Time Since We Met</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-fuchsia-500/20"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: timeLeft.days, label: 'Days', color: 'from-pink-500 to-rose-500' },
                  { value: timeLeft.hours, label: 'Hours', color: 'from-purple-500 to-fuchsia-500' },
                  { value: timeLeft.minutes, label: 'Minutes', color: 'from-fuchsia-500 to-pink-500' },
                  { value: timeLeft.seconds, label: 'Seconds', color: 'from-rose-500 to-orange-500' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`} />
                    <div className="relative bg-gray-900 rounded-2xl p-6 text-center border border-white/5">
                      <motion.div
                        className="text-4xl md:text-5xl font-black text-white"
                        key={item.value}
                        initial={{ scale: 1.2, color: '#fff' }}
                        animate={{ scale: 1, color: '#fff' }}
                        transition={{ duration: 0.3 }}
                      >
                        {String(item.value).padStart(2, '0')}
                      </motion.div>
                      <div className="text-xs text-gray-400 mt-2 uppercase tracking-wider">{item.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {proposal.publishDurationLabel && (
                <p className="text-center mt-6 text-gray-400 text-sm">
                  {proposal.publishDurationLabel}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Final Proposal Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glowing background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-pink-600/20 rounded-[3rem] blur-2xl" />

            <div className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-[3rem] p-12 md:p-16 border border-rose-100 text-center overflow-hidden shadow-xl">

              {/* Soft Glow Background */}
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200 rounded-full blur-[120px] opacity-30" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-300 rounded-full blur-[120px] opacity-30" />

              <div className="relative z-10">

                {/* Ring Animation (Soft) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-6"
                >
                  💍
                </motion.div>

                {/* Heading */}
                <h2 className="text-4xl md:text-5xl font-serif mb-6 text-rose-600 leading-tight">
                  A Little Question...
                  <br />
                  <span className="text-stone-700 italic">From My Heart</span>
                </h2>

                {/* Text */}
                <p className="text-lg text-stone-500 mb-10 font-light max-w-xl mx-auto">
                  {proposal.girlName}, in all the beautiful moments we’ve shared…
                  would you like to be my{" "}
                  <span className="text-rose-500 font-semibold">
                    {proposal.relationshipType || "forever person"}
                  </span>
                  ?
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">

                  {/* YES BUTTON (Elegant 💖) */}
                  <motion.button
                    className="px-10 py-4 bg-rose-500 text-white rounded-full font-medium tracking-wide shadow-md hover:bg-rose-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProposalResponse("yes")}
                  >
                    Yes, Always 💖
                  </motion.button>

                  {/* THINK BUTTON (Cute 😄) */}
                  <motion.button
                    className="px-10 py-4 border border-rose-200 text-rose-500 rounded-full font-medium hover:bg-rose-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProposalResponse("think")}
                  >
                    I Need a Moment 🤍
                  </motion.button>
                </div>

                {/* Response */}
                {proposalResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-10 rounded-2xl px-6 py-5 text-base ${proposalResponse === "yes"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-stone-100 text-stone-600"
                      }`}
                  >
                    {proposalResponse === "yes" ? (
                      <div>
                        💖 This just became my favorite moment ever.
                        Thank you for choosing me.
                      </div>
                    ) : (
                      <div>
                        😊 Take your time… good things are always worth waiting for.
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2 text-lg">
            Made with
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-pink-500"
            >
              🔥
            </motion.span>
            for {proposal.girlName}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {template?.name} • {proposal.templateId}
          </p>
        </div>
      </footer>
    </main>
  );
}
