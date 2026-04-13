import { type RelationshipType } from "@/lib/proposal-storage";

export type ProposalTemplate = {
  id: string;
  relationshipType: RelationshipType;
  name: string;
  tagline: string;
  description: string;
  family: "romantic" | "royal" | "dreamy";
  image: string;
  icon?: string;
  features?: string[];
  isPremium?: boolean;
  rendererKey?: string;
};

export const proposalTemplates: ProposalTemplate[] = [
  {
    id: "gf-rose-glass",
    relationshipType: "GF",
    name: "Rose Glass",
    tagline: "Soft pink, premium, cinematic",
    description: "For a modern girlfriend proposal with glowing glass cards and a luxury romantic feel.",
    family: "romantic",
    image: "",
    rendererKey: "Girlfriend-Collection/proposal-experience",
  },
  {
    id: "gf-midnight-bloom",
    relationshipType: "GF",
    name: "Midnight Bloom",
    tagline: "Dark floral, intense, dramatic",
    description: "A richer girlfriend template with deeper contrast and strong spotlight sections.",
    family: "romantic",
    image: "",
    rendererKey: "Girlfriend-Collection/praposal-experience2",
  },
  {
    id: "gf-soft-letter",
    relationshipType: "GF",
    name: "Soft Letter",
    tagline: "Light, delicate, handwritten feel",
    description: "A calm girlfriend template with softer sections and a more personal love-letter mood.",
    family: "romantic",
    image: "",
    rendererKey: "Girlfriend-Collection/praposal-exprience3",
  },



  {
    id: "wife-eternal-vow",
    relationshipType: "Wife",
    name: "Eternal Vow",
    tagline: "Elegant, warm, timeless",
    description: "For wife-focused proposals with a mature layout, vow-style sections, and champagne tones.",
    family: "royal",
    image: "",
    rendererKey: "Wife-Collection/wifecollection1",
  },
  {
    id: "wife-golden-legacy",
    relationshipType: "Wife",
    name: "Golden Legacy",
    tagline: "Refined, graceful, premium",
    description: "A more royal template designed for commitment, memory, and forever promises.",
    family: "royal",
    image: "",
    rendererKey: "Wife-Collection/proposal-template2",
  },
  {
    id: "wife-classic-manor",
    relationshipType: "Wife",
    name: "Classic Manor",
    tagline: "Structured, timeless, graceful",
    description: "A wife template with a stately structure, elegant spacing, and vow-centered storytelling.",
    family: "royal",
    image: "",
    rendererKey: "Wife-Collection/wife-collection2",
  },



  {
    id: "crush-dream-letter",
    relationshipType: "Crush",
    name: "Dream Letter",
    tagline: "Light, playful, magical",
    description: "For crush proposals with floating charm, sweet anticipation, and gentle storytelling.",
    family: "dreamy",
    image: "",
    rendererKey: "Crush-Collection/crush-collection1",
  },
  {
    id: "crush-sky-confession",
    relationshipType: "Crush",
    name: "Sky Confession",
    tagline: "Airy, youthful, expressive",
    description: "A fresh confession layout that feels hopeful, bright, and a little bold.",
    family: "dreamy",
    image: "",
    rendererKey: "Crush-Collection/crush-collection2",
  },
  {
    id: "crush-starlight-note",
    relationshipType: "Crush",
    name: "Starlight Note",
    tagline: "Cute, cosmic, playful",
    description: "A crush template with soft celestial styling and floating card sections.",
    family: "dreamy",
    image: "",
    rendererKey: "Crush-Collection/proposal-template3",
  },
  {
    id: "best-friends-memory-lane",
    relationshipType: "Best Friends",
    name: "Memory Lane",
    tagline: "Loyal, bright, nostalgic",
    description: "A friendship-first layout built for inside jokes, milestones, and lasting bonds.",
    family: "dreamy",
    image: "",
    rendererKey: "Crush-Collection/crush-collection1",
  },
  {
    id: "boyfrends-midnight-promise",
    relationshipType: "Boyfrends",
    name: "Midnight Promise",
    tagline: "Romantic, calm, sincere",
    description: "A polished layout for heartfelt promises, deep affection, and personal moments.",
    family: "romantic",
    image: "",
    rendererKey: "Girlfriend-Collection/praposal-exprience3",
  },
  {
    id: "dost-yaari-letter",
    relationshipType: "Dost",
    name: "Yaari Letter",
    tagline: "Simple, emotional, honest",
    description: "A clean story layout made for gratitude, trust, and unforgettable friendship memories.",
    family: "dreamy",
    image: "",
    rendererKey: "Crush-Collection/crush-collection2",
  },
  {
    id: "husband-evergreen-vow",
    relationshipType: "Husband",
    name: "Evergreen Vow",
    tagline: "Refined, committed, timeless",
    description: "A mature layout designed for husband-focused love stories, vows, and lifelong partnership.",
    family: "royal",
    image: "",
    rendererKey: "Wife-Collection/wifecollection1",
  },



];
