import { type RelationshipType } from "@/lib/proposal-storage";

export type ProposalTemplate = {
  id: string;
  proposalId: number;
  relationshipType: RelationshipType;
  name: string;
  tagline: string;
  description: string;
  family: "romantic" | "royal" | "dreamy";
  image: string;
};

export const proposalTemplates: ProposalTemplate[] = [
  {
    "id": "gf-rose-glass",
    "proposalId": 1,
    "relationshipType": "GF",
    "name": "Rose Glass",
    "tagline": "Soft pink, premium, cinematic",
    "description": "For a modern girlfriend proposal with glowing glass cards and a luxury romantic feel.",
    "family": "romantic",
    "image": ""
  },
  {
    "id": "gf-midnight-bloom",
    "proposalId": 2,
    "relationshipType": "GF",
    "name": "Midnight Bloom",
    "tagline": "Dark floral, intense, dramatic",
    "description": "A richer girlfriend template with deeper contrast and strong spotlight sections.",
    "family": "romantic",
    "image": ""
  },
  {
    "id": "gf-soft-letter",
    "proposalId": 3,
    "relationshipType": "GF",
    "name": "Soft Letter",
    "tagline": "Light, delicate, handwritten feel",
    "description": "A calm girlfriend template with softer sections and a more personal love-letter mood.",
    "family": "romantic",
    "image": ""
  },
  {
    "id": "gf-blush-frame",
    "proposalId": 4,
    "relationshipType": "GF",
    "name": "Blush Frame",
    "tagline": "Clean, framed, sweet",
    "description": "A balanced girlfriend layout with framed hero blocks and neat memory sections.",
    "family": "romantic",
    "image": ""
  },
  {
    "id": "wife-eternal-vow",
    "proposalId": 5,
    "relationshipType": "Wife",
    "name": "Eternal Vow",
    "tagline": "Elegant, warm, timeless",
    "description": "For wife-focused proposals with a mature layout, vow-style sections, and champagne tones.",
    "family": "royal",
    "image": ""
  },
  {
    "id": "wife-golden-legacy",
    "proposalId": 6,
    "relationshipType": "Wife",
    "name": "Golden Legacy",
    "tagline": "Refined, graceful, premium",
    "description": "A more royal template designed for commitment, memory, and forever promises.",
    "family": "royal",
    "image": ""
  },
  {
    "id": "wife-classic-manor",
    "proposalId": 7,
    "relationshipType": "Wife",
    "name": "Classic Manor",
    "tagline": "Structured, timeless, graceful",
    "description": "A wife template with a stately structure, elegant spacing, and vow-centered storytelling.",
    "family": "royal",
    "image": ""
  },
  {
    "id": "wife-sunset-promise",
    "proposalId": 8,
    "relationshipType": "Wife",
    "name": "Sunset Promise",
    "tagline": "Warm, intimate, heartfelt",
    "description": "A softer wife layout with warm highlights and emotional promise sections.",
    "family": "royal",
    "image": ""
  },
  {
    "id": "crush-dream-letter",
    "proposalId": 9,
    "relationshipType": "Crush",
    "name": "Dream Letter",
    "tagline": "Light, playful, magical",
    "description": "For crush proposals with floating charm, sweet anticipation, and gentle storytelling.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-sky-confession",
    "proposalId": 10,
    "relationshipType": "Crush",
    "name": "Sky Confession",
    "tagline": "Airy, youthful, expressive",
    "description": "A fresh confession layout that feels hopeful, bright, and a little bold.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-starlight-note",
    "proposalId": 11,
    "relationshipType": "Crush",
    "name": "Starlight Note",
    "tagline": "Cute, cosmic, playful",
    "description": "A crush template with soft celestial styling and floating card sections.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-first-smile",
    "proposalId": 12,
    "relationshipType": "Crush",
    "name": "First Smile",
    "tagline": "Bright, simple, honest",
    "description": "A minimal confession template built around first impressions and sweet sincerity.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-golden-confession",
    "proposalId": 13,
    "relationshipType": "Crush",
    "name": "Golden Confession",
    "tagline": "Luxury black-gold, interactive, premium",
    "description": "A premium crush template with black and gold styling, interactive confession modes, and a cinematic proposal reveal.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-velvet-spark",
    "proposalId": 14,
    "relationshipType": "Crush",
    "name": "Velvet Spark",
    "tagline": "Modern black-gold, bold, smooth",
    "description": "A sharper crush proposal style with confident wording and a sleek premium confession layout.",
    "family": "dreamy",
    "image": ""
  },
  {
    "id": "crush-cosmic-promise",
    "proposalId": 15,
    "relationshipType": "Crush",
    "name": "Cosmic Promise",
    "tagline": "Mystical black-gold, dreamy, poetic",
    "description": "A poetic crush proposal built around celestial mood, dreamy lines, and a premium reveal experience.",
    "family": "dreamy",
    "image": ""
  }
];
