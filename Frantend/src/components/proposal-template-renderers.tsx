"use client";

import { GoldenConfessionTemplate } from "@/components/golden-confession-template";
import {
  EditorialProposalTemplate,
  type EditorialProposalTemplateConfig,
} from "@/components/editorial-proposal-template";
import {
  PremiumProposalTemplate,
  type PremiumProposalTemplateConfig,
} from "@/components/premium-proposal-template";
import { type ProposalData } from "@/lib/proposal-storage";

type RendererProps = {
  proposal: ProposalData;
  activeTemplateName: string;
};

type Renderer = React.FC<RendererProps>;

function createPremiumRenderer(config: PremiumProposalTemplateConfig): Renderer {
  const PremiumRenderer: Renderer = ({ proposal, activeTemplateName }) => (
    <PremiumProposalTemplate
      proposal={proposal}
      activeTemplateName={activeTemplateName}
      config={config}
    />
  );

  PremiumRenderer.displayName = `PremiumRenderer:${config.themeName}`;
  return PremiumRenderer;
}

function createEditorialRenderer(config: EditorialProposalTemplateConfig): Renderer {
  const EditorialRenderer: Renderer = ({ proposal, activeTemplateName }) => (
    <EditorialProposalTemplate
      proposal={proposal}
      activeTemplateName={activeTemplateName}
      config={config}
    />
  );

  EditorialRenderer.displayName = `EditorialRenderer:${config.heading}`;
  return EditorialRenderer;
}

function createGoldenRenderer(
  defaultVariant: "classic" | "modern" | "mystical",
  defaultTone: "romantic" | "playful" | "poetic",
): Renderer {
  const GoldenRenderer: Renderer = ({ proposal, activeTemplateName }) => (
    <GoldenConfessionTemplate
      proposal={proposal}
      activeTemplateName={activeTemplateName}
      defaultVariant={defaultVariant}
      defaultTone={defaultTone}
    />
  );

  GoldenRenderer.displayName = `GoldenRenderer:${defaultVariant}:${defaultTone}`;
  return GoldenRenderer;
}

const customProposalRenderers: Record<number, Renderer> = {
  1: createPremiumRenderer({
    eyebrow: "Romantic & Radiant",
    title: "Rose Glass",
    subtitle:
      "Soft, glowing, and cinematic. Built for a girlfriend proposal that feels elegant and deeply personal.",
    themeName: "Rose Glass",
    background: "radial-gradient(circle at top, #2a1120 0%, #120811 38%, #050304 100%)",
    panelBackground: "rgba(33, 16, 24, 0.72)",
    borderColor: "rgba(255, 191, 214, 0.18)",
    accent: "linear-gradient(135deg, #ffb6cf 0%, #ffcfe0 100%)",
    accentSoft: "rgba(255, 182, 207, 0.12)",
    accentText: "#ffc8dc",
    heroTag: "Cinematic Romance",
    promiseLine:
      "A soft and glowing confession made for a love story that feels dreamy, warm, and unforgettable.",
    question: "Will you let this become our sweetest chapter,",
    sectionLabels: {
      story: "How It Began",
      qualities: "Why You Shine",
      future: "What I Want With You",
    },
  }),
  2: createEditorialRenderer({
    label: "Romantic & Radiant",
    heading: "Midnight Bloom",
    intro:
      "An editorial layout with stronger contrast, dramatic spacing, and a more cinematic reading flow for a deeper confession.",
    background: "linear-gradient(135deg, #12070c 0%, #1b0d14 38%, #050304 100%)",
    shell: "rgba(30, 14, 21, 0.82)",
    border: "rgba(245, 123, 145, 0.2)",
    accent: "#ffb3c1",
    accentMuted: "rgba(245, 123, 145, 0.12)",
    question: "Can I be the one who stays in your heart,",
  }),
  3: createPremiumRenderer({
    eyebrow: "Romantic & Radiant",
    title: "Soft Letter",
    subtitle:
      "A quiet, handwritten-feel proposal for gentle emotions, intimate moments, and warm honesty.",
    themeName: "Soft Letter",
    background: "radial-gradient(circle at top, #291a14 0%, #15100b 42%, #050403 100%)",
    panelBackground: "rgba(31, 23, 16, 0.74)",
    borderColor: "rgba(234, 204, 170, 0.18)",
    accent: "linear-gradient(135deg, #e7c8a0 0%, #f1dfc7 100%)",
    accentSoft: "rgba(231, 200, 160, 0.12)",
    accentText: "#f0d9bb",
    heroTag: "Handwritten Mood",
    promiseLine:
      "A tender and personal format for words that feel less like performance and more like truth.",
    question: "Will you let me write the next part with you,",
    sectionLabels: {
      story: "The Memory",
      qualities: "What I Notice",
      future: "My Quiet Hope",
    },
  }),
  4: createEditorialRenderer({
    label: "Romantic & Radiant",
    heading: "Blush Frame",
    intro:
      "A cleaner framed composition for users who want romance to feel polished, balanced, and presentation-first.",
    background: "linear-gradient(135deg, #120a0f 0%, #24131b 48%, #040304 100%)",
    shell: "rgba(30, 16, 22, 0.82)",
    border: "rgba(255, 170, 193, 0.2)",
    accent: "#ffd0de",
    accentMuted: "rgba(255, 171, 193, 0.12)",
    question: "Will you let us frame this feeling forever,",
  }),
  5: createPremiumRenderer({
    eyebrow: "Timeless & Devoted",
    title: "Eternal Vow",
    subtitle:
      "Elegant and mature. Designed for vows, commitment, and love that has already proven its depth.",
    themeName: "Eternal Vow",
    background: "radial-gradient(circle at top, #271b0f 0%, #120d08 40%, #030303 100%)",
    panelBackground: "rgba(26, 18, 10, 0.76)",
    borderColor: "rgba(212, 175, 55, 0.2)",
    accent: "linear-gradient(135deg, #d4af37 0%, #f6dc8c 100%)",
    accentSoft: "rgba(212, 175, 55, 0.1)",
    accentText: "#f6dc8c",
    heroTag: "Vow Collection",
    promiseLine:
      "Built for lifelong promises, steady love, and the kind of devotion that deserves a timeless setting.",
    question: "Will you let me keep choosing you, always and forever,",
    sectionLabels: {
      story: "Our Journey",
      qualities: "What I Revere",
      future: "The Life I Choose",
    },
  }),
  6: createEditorialRenderer({
    label: "Timeless & Devoted",
    heading: "Golden Legacy",
    intro:
      "A richer editorial proposal focused on history, gratitude, and commitment, with a more royal magazine-like composition.",
    background: "linear-gradient(135deg, #100b06 0%, #22190d 44%, #020202 100%)",
    shell: "rgba(24, 18, 9, 0.84)",
    border: "rgba(212, 175, 55, 0.22)",
    accent: "#f0d98b",
    accentMuted: "rgba(212, 175, 55, 0.1)",
    question: "Will you carry this golden forever with me,",
  }),
  7: createPremiumRenderer({
    eyebrow: "Timeless & Devoted",
    title: "Classic Manor",
    subtitle:
      "Structured, stately, and graceful. A composed preview for a wife-centered proposal with lasting depth.",
    themeName: "Classic Manor",
    background: "radial-gradient(circle at top, #1f170f 0%, #0f0b08 40%, #030303 100%)",
    panelBackground: "rgba(21, 17, 12, 0.78)",
    borderColor: "rgba(200, 176, 120, 0.18)",
    accent: "linear-gradient(135deg, #c7ab74 0%, #ead7b1 100%)",
    accentSoft: "rgba(199, 171, 116, 0.1)",
    accentText: "#e9d8b1",
    heroTag: "Stately Grace",
    promiseLine:
      "Made for calm certainty, elegant storytelling, and a promise that stands on a strong foundation.",
    question: "Will you let this promise become our home,",
    sectionLabels: {
      story: "The Foundation",
      qualities: "What Steadies Me",
      future: "What I Promise",
    },
  }),
  8: createEditorialRenderer({
    label: "Timeless & Devoted",
    heading: "Sunset Promise",
    intro:
      "A warm editorial canvas for softer vows and intimate emotional storytelling with a sunset-toned palette.",
    background: "linear-gradient(135deg, #1a0f09 0%, #3b2113 44%, #040303 100%)",
    shell: "rgba(35, 18, 12, 0.84)",
    border: "rgba(240, 168, 97, 0.2)",
    accent: "#f8cf95",
    accentMuted: "rgba(240, 168, 97, 0.1)",
    question: "Will you let this sunset lead us into forever,",
  }),
  9: createPremiumRenderer({
    eyebrow: "Bold & Electric",
    title: "Dream Letter",
    subtitle:
      "Light, magical, and confession-first. A sweet crush proposal with soft energy and playful hope.",
    themeName: "Dream Letter",
    background: "radial-gradient(circle at top, #1f1734 0%, #100c19 40%, #040306 100%)",
    panelBackground: "rgba(21, 16, 35, 0.76)",
    borderColor: "rgba(177, 153, 255, 0.18)",
    accent: "linear-gradient(135deg, #b7a3ff 0%, #f1dcff 100%)",
    accentSoft: "rgba(183, 163, 255, 0.12)",
    accentText: "#dccbff",
    heroTag: "Sweet Confession",
    promiseLine:
      "For crush feelings that are soft, exciting, and full of that first magical rush.",
    question: "Will you let this dream become real,",
    sectionLabels: {
      story: "The Moment",
      qualities: "What Caught Me",
      future: "What I Hope For",
    },
  }),
  10: createEditorialRenderer({
    label: "Bold & Electric",
    heading: "Sky Confession",
    intro:
      "An airy proposal design with open space, confident copy blocks, and a lighter preview structure for first-step honesty.",
    background: "linear-gradient(135deg, #0a121d 0%, #14263e 44%, #020305 100%)",
    shell: "rgba(17, 28, 44, 0.84)",
    border: "rgba(122, 191, 255, 0.2)",
    accent: "#cce8ff",
    accentMuted: "rgba(122, 191, 255, 0.12)",
    question: "Will you let me turn this feeling into something beautiful,",
  }),
  11: createPremiumRenderer({
    eyebrow: "Bold & Electric",
    title: "Starlight Note",
    subtitle:
      "Cute, cosmic, and playful. A floating crush proposal with a celestial and charming mood.",
    themeName: "Starlight Note",
    background: "radial-gradient(circle at top, #1e1630 0%, #0d0a15 40%, #020204 100%)",
    panelBackground: "rgba(22, 17, 34, 0.76)",
    borderColor: "rgba(214, 183, 255, 0.18)",
    accent: "linear-gradient(135deg, #c59fff 0%, #f2dcff 100%)",
    accentSoft: "rgba(197, 159, 255, 0.12)",
    accentText: "#ebd6ff",
    heroTag: "Celestial Crush",
    promiseLine:
      "Designed for a crush that feels playful, cosmic, and impossible to ignore.",
    question: "Will you let this little starlight become ours,",
    sectionLabels: {
      story: "Star Moment",
      qualities: "What Glows",
      future: "What I Imagine",
    },
  }),
  12: createEditorialRenderer({
    label: "Bold & Electric",
    heading: "First Smile",
    intro:
      "A simpler and cleaner confession preview that keeps the focus on sincerity, first impressions, and direct intent.",
    background: "linear-gradient(135deg, #120d07 0%, #2b1f10 46%, #030302 100%)",
    shell: "rgba(28, 21, 12, 0.82)",
    border: "rgba(255, 215, 120, 0.2)",
    accent: "#ffe9ab",
    accentMuted: "rgba(255, 215, 111, 0.12)",
    question: "Will you let me be honest with my heart,",
  }),
  13: createGoldenRenderer("classic", "romantic"),
  14: createGoldenRenderer("modern", "playful"),
  15: createGoldenRenderer("mystical", "poetic"),
};

export function getCustomProposalRenderer(proposalId: number) {
  return customProposalRenderers[proposalId] ?? null;
}
