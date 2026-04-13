"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { type ProposalTemplate } from "@/lib/proposal-templates";
import { RELATIONSHIP_TYPES, type RelationshipType } from "@/lib/proposal-storage";

const CATEGORY_META: Record<RelationshipType, {
  label: string;
  headline: string;
  byline: string;
}> = {
  GF: {
    label: "Girlfriend",
    headline: "Romantic & Radiant",
    byline: "Premium layouts for a girlfriend proposal that feels cinematic.",
  },
  Wife: {
    label: "Wife",
    headline: "Timeless & Devoted",
    byline: "Elegant layouts for mature promises and forever moments.",
  },
  Crush: {
    label: "Crush",
    headline: "Bold & Electric",
    byline: "Confession-first layouts with a lighter, sweeter tone.",
  },
  "Best Friends": {
    label: "Best Friends",
    headline: "Warm & Unfiltered",
    byline: "Story-driven layouts for friendship, loyalty, and forever bonds.",
  },
  Boyfrends: {
    label: "Boyfrends",
    headline: "Deep & Devoted",
    byline: "Romantic layouts tuned for heartfelt notes, memories, and promises.",
  },
  Dost: {
    label: "Dost",
    headline: "Pure & Personal",
    byline: "Simple, emotional layouts for yaari, gratitude, and meaningful words.",
  },
  Husband: {
    label: "Husband",
    headline: "Strong & Timeless",
    byline: "Elegant layouts for commitment, partnership, and lifelong love.",
  },
};

type TemplateStatus = {
  label: string;
  tone?: "accent" | "muted";
};

function TemplateCard({
  template,
  selected,
  busy,
  primaryLabel,
  status,
  onView,
  onPrimary,
}: {
  template: ProposalTemplate;
  selected: boolean;
  busy: boolean;
  primaryLabel: string;
  status?: TemplateStatus | null;
  onView: () => void;
  onPrimary: () => void;
}) {
  const statusTone = status?.tone ?? "accent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      style={{
        borderRadius: 24,
        border: `1px solid ${selected ? "rgba(212,175,55,0.34)" : "rgba(255,255,255,0.08)"}`,
        background: selected
          ? "linear-gradient(160deg,rgba(212,175,55,0.09),rgba(255,255,255,0.03))"
          : "rgba(255,255,255,0.03)",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            {template.relationshipType} · {template.family}
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.65rem", fontWeight: 400, color: "#f5f0e8", lineHeight: 1.05 }}>
            {template.name}
          </h3>
        </div>
        {selected && (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(212,175,55,0.3)",
              background: "rgba(212,175,55,0.12)",
              color: "#d4af37",
              fontFamily: "'Syne', sans-serif",
              fontSize: 8,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Selected
          </span>
        )}
      </div>

      <div
        style={{
          borderRadius: 20,
          minHeight: 180,
          background: template.image
            ? `linear-gradient(rgba(8,6,4,0.25), rgba(8,6,4,0.75)), url(${template.image}) center/cover`
            : template.family === "royal"
              ? "linear-gradient(135deg,#271f0f,#8d6f22,#16110a)"
              : template.family === "dreamy"
                ? "linear-gradient(135deg,#16130d,#7c6320,#0b0a08)"
                : "linear-gradient(135deg,#261c13,#b58a2a,#16100a)",
          marginBottom: "1rem",
          padding: "1.2rem",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>
          {template.tagline}
        </p>
      </div>

      {status && (
        <div style={{ marginBottom: "0.9rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              fontFamily: "'Syne', sans-serif",
              fontSize: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: statusTone === "accent" ? "1px solid rgba(212,175,55,0.24)" : "1px solid rgba(255,255,255,0.1)",
              background: statusTone === "accent" ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.04)",
              color: statusTone === "accent" ? "#d4af37" : "rgba(255,255,255,0.6)",
            }}
          >
            {status.label}
          </span>
        </div>
      )}

      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.46)", lineHeight: 1.7, marginBottom: "1.2rem" }}>
        {template.description}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onView}
          disabled={busy}
          style={{
            padding: "11px 16px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.78)",
            cursor: busy ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          View Template
        </button>
        
        <button
          type="button"
          onClick={onPrimary}
          disabled={busy}
          style={{
            padding: "11px 16px",
            borderRadius: 999,
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(212,175,55,0.12)",
            color: "#d4af37",
            cursor: busy ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {primaryLabel}
        </button>
      </div>
    </motion.div>
  );
}

export function TemplateCatalog({
  templates,
  selectedTemplateId,
  busyTemplateId,
  onView,
  onPrimaryAction,
  getPrimaryLabel,
  getTemplateStatus,
}: {
  templates: ProposalTemplate[];
  selectedTemplateId: string;
  busyTemplateId?: string;
  onView: (templateId: string) => void;
  onPrimaryAction: (templateId: string) => void;
  getPrimaryLabel: (template: ProposalTemplate) => string;
  getTemplateStatus?: (template: ProposalTemplate) => TemplateStatus | null;
}) {
  const grouped = useMemo(
    () =>
      RELATIONSHIP_TYPES.reduce((acc, type) => {
        acc[type] = templates.filter((item) => item.relationshipType === type);
        return acc;
      }, {} as Record<RelationshipType, ProposalTemplate[]>),
    [templates],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {RELATIONSHIP_TYPES.map((type) => (
        <section
          key={type}
          style={{ padding: "1.5rem", borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.45rem" }}>
              {CATEGORY_META[type].label} Collection
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, marginBottom: "0.25rem" }}>
              {CATEGORY_META[type].headline}
            </h2>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.42)" }}>
              {CATEGORY_META[type].byline}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "1rem" }}>
            {grouped[type].map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplateId === template.id}
                busy={busyTemplateId === template.id}
                primaryLabel={getPrimaryLabel(template)}
                status={getTemplateStatus?.(template)}
                onView={() => onView(template.id)}
                onPrimary={() => onPrimaryAction(template.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
