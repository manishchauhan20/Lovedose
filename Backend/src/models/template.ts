import { z } from "zod";
import { relationshipTypeSchema } from "./proposal.js";

export const templateFamilySchema = z.enum(["romantic", "royal", "dreamy"]);

export const proposalTemplateSchema = z.object({
  id: z.string().min(1),
  relationshipType: relationshipTypeSchema,
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  family: templateFamilySchema,
  image: z.string().default(""),
});

export type ProposalTemplate = z.infer<typeof proposalTemplateSchema>;

export const proposalTemplates: ProposalTemplate[] = [
  {
    id: "gf-rose-glass",
    relationshipType: "GF",
    name: "Rose Glass",
    tagline: "Soft pink, premium, cinematic",
    description:
      "For a modern girlfriend proposal with glowing glass cards and a luxury romantic feel.",
    family: "romantic",
    image: "",
  },
  {
    id: "gf-midnight-bloom",
    relationshipType: "GF",
    name: "Midnight Bloom",
    tagline: "Dark floral, intense, dramatic",
    description:
      "A richer girlfriend template with deeper contrast and strong spotlight sections.",
    family: "romantic",
    image: "",
  },
  {
    id: "gf-soft-letter",
    relationshipType: "GF",
    name: "Soft Letter",
    tagline: "Light, delicate, handwritten feel",
    description:
      "A calm girlfriend template with softer sections and a more personal love-letter mood.",
    family: "romantic",
    image: "",
  },
  {
    id: "gf-blush-frame",
    relationshipType: "GF",
    name: "Blush Frame",
    tagline: "Clean, framed, sweet",
    description:
      "A balanced girlfriend layout with framed hero blocks and neat memory sections.",
    family: "romantic",
    image: "",
  },
  {
    id: "wife-eternal-vow",
    relationshipType: "Wife",
    name: "Eternal Vow",
    tagline: "Elegant, warm, timeless",
    description:
      "For wife-focused proposals with a mature layout, vow-style sections, and champagne tones.",
    family: "royal",
    image: "",
  },
  {
    id: "wife-golden-legacy",
    relationshipType: "Wife",
    name: "Golden Legacy",
    tagline: "Refined, graceful, premium",
    description:
      "A more royal template designed for commitment, memory, and forever promises.",
    family: "royal",
    image: "",
  },
  {
    id: "wife-classic-manor",
    relationshipType: "Wife",
    name: "Classic Manor",
    tagline: "Structured, timeless, graceful",
    description:
      "A wife template with a stately structure, elegant spacing, and vow-centered storytelling.",
    family: "royal",
    image: "",
  },
  {
    id: "wife-sunset-promise",
    relationshipType: "Wife",
    name: "Sunset Promise",
    tagline: "Warm, intimate, heartfelt",
    description:
      "A softer wife layout with warm highlights and emotional promise sections.",
    family: "royal",
    image: "",
  },
  {
    id: "crush-dream-letter",
    relationshipType: "Crush",
    name: "Dream Letter",
    tagline: "Light, playful, magical",
    description:
      "For crush proposals with floating charm, sweet anticipation, and gentle storytelling.",
    family: "dreamy",
    image: "",
  },
  {
    id: "crush-sky-confession",
    relationshipType: "Crush",
    name: "Sky Confession",
    tagline: "Airy, youthful, expressive",
    description:
      "A fresh confession layout that feels hopeful, bright, and a little bold.",
    family: "dreamy",
    image: "",
  },
  {
    id: "crush-starlight-note",
    relationshipType: "Crush",
    name: "Starlight Note",
    tagline: "Cute, cosmic, playful",
    description:
      "A crush template with soft celestial styling and floating card sections.",
    family: "dreamy",
    image: "",
  },
  {
    id: "crush-first-smile",
    relationshipType: "Crush",
    name: "First Smile",
    tagline: "Bright, simple, honest",
    description:
      "A minimal confession template built around first impressions and sweet sincerity.",
    family: "dreamy",
    image: "",
  },
  {
    id: "best-friends-memory-lane",
    relationshipType: "Best Friends",
    name: "Memory Lane",
    tagline: "Loyal, bright, nostalgic",
    description:
      "A friendship-first layout built for inside jokes, milestones, and lasting bonds.",
    family: "dreamy",
    image: "",
  },
  {
    id: "boyfrends-midnight-promise",
    relationshipType: "Boyfrends",
    name: "Midnight Promise",
    tagline: "Romantic, calm, sincere",
    description:
      "A polished layout for heartfelt promises, deep affection, and personal moments.",
    family: "romantic",
    image: "",
  },
  {
    id: "dost-yaari-letter",
    relationshipType: "Dost",
    name: "Yaari Letter",
    tagline: "Simple, emotional, honest",
    description:
      "A clean story layout made for gratitude, trust, and unforgettable friendship memories.",
    family: "dreamy",
    image: "",
  },
  {
    id: "husband-evergreen-vow",
    relationshipType: "Husband",
    name: "Evergreen Vow",
    tagline: "Refined, committed, timeless",
    description:
      "A mature layout designed for husband-focused love stories, vows, and lifelong partnership.",
    family: "royal",
    image: "",
  },
];
