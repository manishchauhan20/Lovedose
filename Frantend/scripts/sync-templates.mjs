import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceFile = path.resolve(root, "..", "frantend-temp", "templates.json");
const targetFile = path.resolve(root, "src", "lib", "generated-proposal-templates.ts");

const allowedRelationshipTypes = new Set(["GF", "Wife", "Crush"]);
const allowedFamilies = new Set(["romantic", "royal", "dreamy"]);

function validateTemplate(template, index) {
  if (typeof template !== "object" || template === null) {
    throw new Error(`Template at index ${index} must be an object`);
  }

  const requiredKeys = ["id", "relationshipType", "name", "tagline", "description", "family"];

  for (const key of requiredKeys) {
    if (typeof template[key] !== "string" || !template[key].trim()) {
      throw new Error(`Template at index ${index} has invalid "${key}"`);
    }
  }

  if (!allowedRelationshipTypes.has(template.relationshipType)) {
    throw new Error(`Template "${template.id}" has invalid relationshipType`);
  }

  if (!allowedFamilies.has(template.family)) {
    throw new Error(`Template "${template.id}" has invalid family`);
  }

  if ("image" in template && typeof template.image !== "string") {
    throw new Error(`Template "${template.id}" has invalid image`);
  }

  if (typeof template.proposalId !== "number" || !Number.isInteger(template.proposalId) || template.proposalId < 1) {
    throw new Error(`Template "${template.id}" has invalid proposalId`);
  }
}

async function main() {
  const raw = await readFile(sourceFile, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("templates.json must export an array");
  }

  parsed.forEach(validateTemplate);

  const fileContents = `import { type RelationshipType } from "@/lib/proposal-storage";

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

export const proposalTemplates: ProposalTemplate[] = ${JSON.stringify(parsed, null, 2)};\n`;

  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, fileContents, "utf8");
  console.log(`Synced ${parsed.length} templates from ${sourceFile}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Template sync failed");
  process.exit(1);
});
