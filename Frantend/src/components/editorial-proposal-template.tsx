"use client";

import { type ProposalData } from "@/lib/proposal-storage";

export type EditorialProposalTemplateConfig = {
  label: string;
  heading: string;
  intro: string;
  background: string;
  shell: string;
  border: string;
  accent: string;
  accentMuted: string;
  question: string;
};

export function EditorialProposalTemplate({
  proposal,
  activeTemplateName,
  config,
}: {
  proposal: ProposalData;
  activeTemplateName: string;
  config: EditorialProposalTemplateConfig;
}) {
  return (
    <div style={{ minHeight: "100vh", background: config.background, color: "#f8f5ef" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;500;600&family=Manrope:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)", gap: "1.5rem" }}>
          <section style={{ borderRadius: 34, padding: "2rem", background: config.shell, border: `1px solid ${config.border}` }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.76rem", letterSpacing: "0.24em", textTransform: "uppercase", color: config.accent, marginBottom: "1.2rem" }}>
              {config.label}
            </p>
            <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "clamp(2.6rem,6vw,4.6rem)", lineHeight: 0.98, fontWeight: 500, marginBottom: "1rem" }}>
              {config.heading}
            </h1>
            <p style={{ fontFamily: "'Manrope', sans-serif", color: "rgba(248,245,239,0.72)", lineHeight: 1.9, marginBottom: "1.8rem" }}>
              {config.intro}
            </p>

            <div style={{ display: "grid", gap: "0.9rem" }}>
              {[
                { label: "Template", value: activeTemplateName },
                { label: "For", value: proposal.girlName || "Your special someone" },
                { label: "From", value: proposal.boyName || "Someone deeply sincere" },
                { label: "Memory", value: proposal.howWeMet || proposal.heroImageCaption || "A beginning worth preserving." },
              ].map((item) => (
                <div key={item.label} style={{ borderRadius: 20, padding: "1rem 1.1rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${config.border}` }}>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: config.accent, marginBottom: "0.4rem" }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: "1rem", lineHeight: 1.7 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ borderRadius: 34, padding: "2rem", background: config.shell, border: `1px solid ${config.border}`, display: "grid", gap: "1.2rem" }}>
            {[
              {
                title: "The Story",
                value: proposal.howWeMet || "Every lasting feeling begins in one unforgettable moment.",
              },
              {
                title: "What I Feel",
                value: proposal.whyILoveYou || proposal.message || "Some feelings become impossible to keep hidden.",
              },
              {
                title: "The Future",
                value: proposal.futureDreams || "I want to explore what this could become, honestly and beautifully.",
              },
            ].map((section) => (
              <div key={section.title} style={{ paddingBottom: "1rem", borderBottom: `1px solid ${config.border}` }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: config.accent, marginBottom: "0.6rem" }}>
                  {section.title}
                </p>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "rgba(248,245,239,0.82)" }}>
                  {section.value}
                </p>
              </div>
            ))}

            <div style={{ borderRadius: 24, padding: "1.4rem", background: config.accentMuted, border: `1px solid ${config.border}` }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: config.accent, marginBottom: "0.7rem" }}>
                The Question
              </p>
              <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.08, fontWeight: 500, marginBottom: "1rem" }}>
                {config.question} {proposal.girlName || "?"}
              </h2>
              <div style={{ display: "inline-flex", padding: "0.85rem 1.3rem", borderRadius: 999, background: config.accent, color: "#141414", fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Say Yes
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
