"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Clock3,
  Copy,
  Crown,
  Eye,
  Heart,
  HeartHandshake,
  LayoutTemplate,
  Moon,
  RefreshCw,
  Share2,
  Signature,
  Sparkles,
  Star,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { type ProposalData } from "@/lib/proposal-storage";

type CrushTone = "romantic" | "playful" | "poetic";
type CrushVariant = "classic" | "modern" | "mystical";

const toneOptions: Array<readonly [CrushTone, string]> = [
  ["romantic", "Romantic"],
  ["playful", "Playful"],
  ["poetic", "Poetic"],
];

const variantOptions: Array<{
  id: CrushVariant;
  title: string;
  description: string;
  tags: string[];
  Icon: typeof Crown;
}> = [
  {
    id: "classic",
    title: "Royal Elegance",
    description: "Timeless sophistication with classical romantic prose and majestic presentation.",
    tags: ["Classic", "Elegant"],
    Icon: Crown,
  },
  {
    id: "modern",
    title: "Modern Minimal",
    description: "Clean, bold statements with contemporary design and striking visuals.",
    tags: ["Bold", "Clean"],
    Icon: Zap,
  },
  {
    id: "mystical",
    title: "Celestial Dreams",
    description: "Cosmic metaphors and starry imagery for a dreamy confession.",
    tags: ["Dreamy", "Cosmic"],
    Icon: Moon,
  },
];

const tips = [
  {
    Icon: Clock3,
    title: "Perfect Timing",
    text: "Choose a moment when they are relaxed and you have their full attention.",
  },
  {
    Icon: Eye,
    title: "Eye Contact",
    text: "Gentle eye contact makes the confession feel more sincere and memorable.",
  },
  {
    Icon: HeartHandshake,
    title: "Be Genuine",
    text: "Authenticity always lands deeper than a perfectly rehearsed performance.",
  },
];

function generateGoldenConfessionContent(
  proposal: ProposalData,
  variant: CrushVariant,
  tone: CrushTone,
) {
  const crushName = proposal.girlName || "My Love";
  const yourName = proposal.boyName || "Your Secret Admirer";
  const memory = proposal.howWeMet || proposal.heroImageCaption || "the moment I first saw you";
  const qualities = proposal.whyILoveYou || proposal.nickname || "your smile and the way you make everything brighter";

  const templates: Record<CrushVariant, Record<CrushTone, string>> = {
    classic: {
      romantic: `My Dearest ${crushName},

From the very first moment our paths crossed, I knew my life would never feel ordinary again. ${memory} remains in my heart like a scene lit in gold.

I keep returning to ${qualities}. There is something about you that turns simple moments into something unforgettable.

So this is me, honestly and completely: I like you deeply, sincerely, and more than I can hide anymore.

${crushName}, will you give this feeling a chance to become something real?

Forever yours,
${yourName}`,
      playful: `Hey ${crushName},

I tried to stay normal after ${memory}, but that plan failed almost immediately.

Now I am stuck thinking about ${qualities}, and it has become very difficult to act chill around you.

So I will say it properly: I really like you. Enough to risk being dramatic and awkward in premium black-and-gold style.

What do you say? Want to give this beautiful chaos a chance?

Fingers crossed,
${yourName}`,
      poetic: `${crushName},

Since ${memory},
Time has moved differently.
As if the world paused
Just long enough
For my heart to learn your name.

It is ${qualities}
That turns my thoughts into poetry
And my silence into longing.

If this is a beginning,
Let it begin with truth:
I choose you in every unspoken line.

Yours in golden light,
${yourName}`,
    },
    modern: {
      romantic: `${crushName},

Here is the truth.

${memory} stayed with me, and so did you.
What grew after that was not random. It was real.

I admire ${qualities}, but more than that, I admire how clear you make my feelings.

I want a chance with you.
No games. No pretending.
Just something honest and beautiful.

What do you say?

${yourName}`,
      playful: `${crushName},

Quick update: you are officially my favorite plot twist.

After ${memory}, things have not been normal. Mostly because ${qualities} keeps raising the standard for everyone else.

So yes, this is me shooting my shot properly.
I like you. Strongly. Elegantly. Slightly obsessively.

Coffee? Date? A chance?

Your move,
${yourName}`,
      poetic: `${crushName},

Call this a confession wrapped in modern light.

${memory} was the spark.
${qualities} became the flame.

Now every thought of you arrives dressed in gold,
And every feeling asks for courage.

So here it is:
I want more than imagination.
I want us.

${yourName}`,
    },
    mystical: {
      romantic: `My Cosmic ${crushName},

Somewhere between fate and feeling, there was ${memory}.
That was the moment the universe quietly shifted in my favor.

Since then, I have been drawn to ${qualities}. You feel like moonlight with a pulse, like a wish that somehow learned my name.

If the stars truly arrange certain meetings, then I think ours was meant to lead here.

Will you let this become our constellation?

Across all skies,
${yourName}`,
      playful: `${crushName},

Important report from the galaxy:
You are suspiciously unforgettable.

Case file:
- ${memory}
- ${qualities}
- My total inability to move on like a normal person

The evidence is overwhelming.
Therefore I must officially ask:
Would you like to be the best thing that ever happened to me?

Signed by your favorite space cadet,
${yourName}`,
      poetic: `${crushName},

We met inside a moment called ${memory},
But I swear it began long before that.

There is starlight in ${qualities},
And gravity in the way you pull my thoughts back to you.

If longing had a language,
It would sound like your name.

Meet me where dreams become real.

${yourName}`,
    },
  };

  return templates[variant][tone];
}

export function GoldenConfessionTemplate({
  proposal,
  activeTemplateName,
  defaultTone = "romantic",
  defaultVariant = "classic",
}: {
  proposal: ProposalData;
  activeTemplateName: string;
  defaultTone?: CrushTone;
  defaultVariant?: CrushVariant;
}) {
  const [selectedTone, setSelectedTone] = useState<CrushTone>(defaultTone);
  const [selectedVariant, setSelectedVariant] = useState<CrushVariant>(defaultVariant);
  const [showPreview, setShowPreview] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);

  const generatedContent = useMemo(
    () => generateGoldenConfessionContent(proposal, selectedVariant, selectedTone),
    [proposal, selectedVariant, selectedTone],
  );

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3000);
  };

  const handleGenerate = async () => {
    setShowOutput(true);
    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#F4E4BC", "#AA8C2C", "#FFD700"],
    });
    showToast("Your proposal has been crafted");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    showToast("Copied to clipboard");
  };

  return (
    <div style={{ minHeight: "100vh", color: "#F4E4BC", background: "linear-gradient(135deg, #000000 0%, #0A0A0A 100%)", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes goldAurora { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-30px) scale(1.08)} 66%{transform:translate(-18px,22px) scale(0.94)} }
        @keyframes goldShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes heartBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(170,140,44,0.05) 0%, transparent 70%), linear-gradient(135deg, #000000 0%, #0A0A0A 100%)", animation: "goldAurora 20s ease-in-out infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "2rem 1rem 5rem" }}>
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <Sparkles size={20} color="#D4AF37" />
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#D4AF37", fontWeight: 500 }}>Premium Experience</span>
            <Sparkles size={20} color="#D4AF37" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", marginBottom: 16, background: "linear-gradient(135deg, #F4E4BC 0%, #D4AF37 50%, #AA8C2C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "heartBeat 2s ease-in-out infinite" }}>Love Proposal</h1>
          <p style={{ color: "rgba(244,228,188,0.65)", fontSize: "1rem" }}>{activeTemplateName} for {proposal.girlName || "your special someone"}</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)", gap: "2rem", marginBottom: "3rem" }}>
          <section style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 32, padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={20} color="#000" />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem" }}>Personalize Your Message</h2>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {[
                { label: "Their Name", value: proposal.girlName || "-", Icon: User },
                { label: "Your Name", value: proposal.boyName || "-", Icon: Signature },
                { label: "A Special Memory", value: proposal.howWeMet || proposal.heroImageCaption || "Add a memory in the proposal form for richer output.", Icon: Clock3 },
                { label: "What You Adore About Them", value: proposal.whyILoveYou || "Add qualities in the proposal form for richer output.", Icon: Star },
              ].map(({ label, value, Icon }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>{label}</p>
                  <div style={{ position: "relative", minHeight: 56 }}>
                    <Icon size={18} color="#AA8C2C" style={{ position: "absolute", left: 16, top: 16 }} />
                    <div style={{ minHeight: 56, padding: "1rem 1rem 1rem 2.8rem", borderRadius: 16, background: "rgba(10,10,10,0.8)", border: "1px solid rgba(212,175,55,0.3)", lineHeight: 1.7 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>Tone of Message</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                {toneOptions.map(([tone, label]) => (
                  <button key={tone} type="button" onClick={() => setSelectedTone(tone)} style={{ padding: "0.9rem 1rem", borderRadius: 14, border: selectedTone === tone ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.2)", background: selectedTone === tone ? "rgba(212,175,55,0.12)" : "rgba(0,0,0,0.35)", color: "#F4E4BC", cursor: "pointer", fontWeight: 500 }}>{label}</button>
                ))}
              </div>
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 32, padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LayoutTemplate size={20} color="#000" />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem" }}>Choose Template Mood</h2>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                {variantOptions.map(({ id, title, description, tags, Icon }) => {
                  const selected = selectedVariant === id;

                  return (
                    <button key={id} type="button" onClick={() => setSelectedVariant(id)} style={{ cursor: "pointer", textAlign: "left", padding: "1.2rem", borderRadius: 22, border: selected ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.18)", background: selected ? "rgba(212,175,55,0.08)" : "rgba(20,20,20,0.5)", color: "#F4E4BC", transform: selected ? "scale(1.02)" : "none", transition: "all 0.3s ease" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(0,0,0,0.8))", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={30} color="#D4AF37" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div>
                              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", marginBottom: 4 }}>{title}</h3>
                              <p style={{ color: "rgba(244,228,188,0.62)", fontSize: "0.92rem", lineHeight: 1.6 }}>{description}</p>
                            </div>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", opacity: selected ? 1 : 0.25 }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#D4AF37" }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                            {tags.map((tag) => (
                              <span key={tag} style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#AA8C2C", background: "rgba(212,175,55,0.08)", padding: "0.35rem 0.6rem", borderRadius: 999 }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleGenerate()} style={{ flex: 1, minWidth: 220, padding: "1rem 1.2rem", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)", color: "#000", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: "0 10px 40px rgba(212,175,55,0.3)" }}>
                <span>Generate Magic</span>
                <Wand2 size={18} />
              </button>
              <button type="button" onClick={() => setShowPreview(true)} style={{ padding: "1rem 1.2rem", borderRadius: 16, border: "1px solid rgba(212,175,55,0.3)", background: "rgba(20,20,20,0.6)", color: "#F4E4BC", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Eye size={18} />
                <span>Preview</span>
              </button>
            </div>
          </section>
        </div>

        {showOutput && (
          <section style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 32, padding: "2rem 2rem 2.5rem", position: "relative", overflow: "hidden", marginBottom: "3rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "goldShimmer 3s infinite" }} />
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.65rem 1rem", borderRadius: 999, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.22)", marginBottom: 16 }}>
                <Sparkles size={16} color="#D4AF37" />
                <span style={{ color: "#D4AF37", fontWeight: 600 }}>Your Masterpiece is Ready</span>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", textAlign: "left", color: "rgba(244,228,188,0.92)", fontFamily: "'Playfair Display', serif", fontSize: "clamp(1rem, 2vw, 1.4rem)", lineHeight: 1.9, margin: 0 }}>{generatedContent}</pre>
              {proposal.message && (
                <div style={{ marginTop: "1.5rem", padding: "1rem 1.2rem", borderRadius: 18, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.16)", textAlign: "left" }}>
                  <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", marginBottom: 8 }}>Your Custom Message</p>
                  <p style={{ color: "rgba(244,228,188,0.82)", lineHeight: 1.8 }}>{proposal.message}</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(212,175,55,0.14)", paddingTop: "1.5rem" }}>
              <button type="button" onClick={() => void handleCopy()} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.9rem 1.1rem", borderRadius: 14, border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#F4E4BC", cursor: "pointer" }}><Copy size={16} /> Copy Text</button>
              <button type="button" onClick={() => showToast("Sharing options opened")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.9rem 1.1rem", borderRadius: 14, border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#F4E4BC", cursor: "pointer" }}><Share2 size={16} /> Share</button>
              <button type="button" onClick={() => void handleGenerate()} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, padding: "0.9rem 1.1rem", borderRadius: 14, border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#F4E4BC", cursor: "pointer" }}><RefreshCw size={16} /> Regenerate</button>
            </div>
          </section>
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
          {tips.map(({ Icon, title, text }) => (
            <div key={title} style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 24, padding: "1.5rem", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 1rem", borderRadius: "50%", background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={22} color="#D4AF37" /></div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginBottom: 8 }}>{title}</h3>
              <p style={{ color: "rgba(244,228,188,0.6)", lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </section>
      </div>

      {showPreview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", padding: "1rem" }}>
          <div style={{ maxWidth: 1100, height: "100%", margin: "0 auto", background: "rgba(20,20,20,0.92)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 32, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem", borderBottom: "1px solid rgba(212,175,55,0.14)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem" }}>Live Preview</h3>
              <button type="button" onClick={() => setShowPreview(false)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "transparent", color: "#D4AF37", cursor: "pointer" }}><X size={22} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
              <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
                <div style={{ width: 96, height: 96, margin: "0 auto 2rem", borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={42} color="#000" /></div>
                <pre style={{ whiteSpace: "pre-wrap", textAlign: "left", color: "#F4E4BC", fontFamily: "'Playfair Display', serif", fontSize: "clamp(1rem, 2vw, 1.35rem)", lineHeight: 1.9, margin: 0 }}>{generatedContent}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 70, padding: "0.85rem 1.25rem", borderRadius: 999, background: "#D4AF37", color: "#000", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
