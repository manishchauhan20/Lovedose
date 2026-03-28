"use client";

import { type ProposalData } from "@/lib/proposal-storage";

export type PremiumProposalTemplateConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  themeName: string;
  background: string;
  panelBackground: string;
  borderColor: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  heroTag: string;
  promiseLine: string;
  question: string;
  sectionLabels: {
    story: string;
    qualities: string;
    future: string;
  };
};

export function PremiumProposalTemplate({
  proposal,
  activeTemplateName,
  config,
}: {
  proposal: ProposalData;
  activeTemplateName: string;
  config: PremiumProposalTemplateConfig;
}) {
  const story = proposal.howWeMet || "Our story began in a moment that still feels magical.";
  const qualities = proposal.whyILoveYou || "There is something about you that makes every day softer and brighter.";
  const future = proposal.futureDreams || "I want something beautiful, steady, and real with you.";
  const customMessage = proposal.message || `I want to tell ${proposal.girlName || "you"} what my heart has been trying to say.`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: config.background,
        color: "#fffaf0",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Manrope:wght@400;500;600;700&display=swap');
        @keyframes fadeRise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "2rem 1rem 5rem" }}>
        <header style={{ textAlign: "center", marginBottom: "3rem", animation: "fadeRise 0.7s ease both" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.78rem", letterSpacing: "0.28em", textTransform: "uppercase", color: config.accentText, marginBottom: "1rem" }}>
            {config.eyebrow}
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem,7vw,5.5rem)", lineHeight: 0.96, fontWeight: 400, marginBottom: "1rem" }}>
            {config.title}
          </h1>
          <p style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'Manrope', sans-serif", color: "rgba(255,250,240,0.72)", lineHeight: 1.8 }}>
            {config.subtitle}
          </p>
        </header>

        <section
          style={{
            borderRadius: 32,
            padding: "2rem",
            marginBottom: "2rem",
            background: config.panelBackground,
            border: `1px solid ${config.borderColor}`,
            animation: "fadeRise 0.7s ease 0.08s both",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "1.5rem", alignItems: "stretch" }}>
            <div style={{ minHeight: 360, borderRadius: 28, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", background: `linear-gradient(160deg, ${config.accentSoft}, rgba(0,0,0,0.15))`, border: `1px solid ${config.borderColor}` }}>
              <div>
                <span style={{ display: "inline-flex", padding: "0.5rem 0.9rem", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: config.accentText, fontFamily: "'Manrope', sans-serif", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                  {config.heroTag}
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 1, fontWeight: 400, marginBottom: "1rem" }}>
                  {proposal.girlName || "My Love"}
                </h2>
                <p style={{ fontFamily: "'Manrope', sans-serif", color: "rgba(255,250,240,0.72)", lineHeight: 1.8 }}>
                  {config.promiseLine}
                </p>
              </div>

              <div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.76rem", letterSpacing: "0.2em", textTransform: "uppercase", color: config.accentText, marginBottom: "0.45rem" }}>
                  Selected Template
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem" }}>
                  {activeTemplateName}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {[
                { label: "From", value: proposal.boyName || "Someone who adores you" },
                { label: "Memory", value: proposal.howWeMet || proposal.heroImageCaption || "A beautiful beginning." },
                { label: "Nickname", value: proposal.nickname || "Only for you" },
                { label: "Theme", value: config.themeName },
              ].map((item) => (
                <div key={item.label} style={{ borderRadius: 22, padding: "1.1rem 1.2rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${config.borderColor}` }}>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: config.accentText, marginBottom: "0.5rem" }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", lineHeight: 1.35 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem", animation: "fadeRise 0.7s ease 0.16s both" }}>
          {[
            { label: config.sectionLabels.story, value: story },
            { label: config.sectionLabels.qualities, value: qualities },
            { label: config.sectionLabels.future, value: future },
          ].map((item) => (
            <div key={item.label} style={{ borderRadius: 24, padding: "1.4rem", background: config.panelBackground, border: `1px solid ${config.borderColor}` }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: config.accentText, marginBottom: "0.9rem" }}>
                {item.label}
              </p>
              <p style={{ color: "rgba(255,250,240,0.78)", lineHeight: 1.8 }}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section style={{ borderRadius: 32, padding: "2rem", background: config.panelBackground, border: `1px solid ${config.borderColor}`, animation: "fadeRise 0.7s ease 0.24s both" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: config.accentText, marginBottom: "1rem" }}>
            Personal Message
          </p>
          <blockquote style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem,2.8vw,2.1rem)", lineHeight: 1.6, fontStyle: "italic", color: "#fffaf0" }}>
            “{customMessage}”
          </blockquote>
        </section>

        <section style={{ textAlign: "center", marginTop: "3rem", animation: "fadeRise 0.7s ease 0.32s both" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.76rem", letterSpacing: "0.2em", textTransform: "uppercase", color: config.accentText, marginBottom: "0.9rem" }}>
            The Question
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, marginBottom: "1rem" }}>
            {config.question} {proposal.girlName || "?"}
          </h3>
          <div style={{ display: "inline-flex", padding: "0.9rem 1.4rem", borderRadius: 999, background: config.accent, color: "#111", fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Yes, Always
          </div>
        </section>
      </div>
    </div>
  );
}
