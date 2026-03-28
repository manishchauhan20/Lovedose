import { Router } from "express";
import { relationshipTypeSchema } from "../models/proposal.js";
import { proposalTemplates } from "../models/template.js";

const templateRoutes = Router();

templateRoutes.get("/", (request, response) => {
  const relationshipTypeParam = request.query.relationshipType;

  if (!relationshipTypeParam) {
    response.json({ data: proposalTemplates });
    return;
  }

  const parsedRelationshipType = relationshipTypeSchema.safeParse(relationshipTypeParam);

  if (!parsedRelationshipType.success) {
    response.status(400).json({
      message: "Invalid relationshipType query parameter",
      expected: relationshipTypeSchema.options,
    });
    return;
  }

  const filteredTemplates = proposalTemplates.filter(
    (template) => template.relationshipType === parsedRelationshipType.data,
  );

  response.json({ data: filteredTemplates });
});

templateRoutes.get("/:id", (request, response) => {
  const template = proposalTemplates.find((item) => item.id === request.params.id);

  if (!template) {
    response.status(404).json({ message: "Template not found" });
    return;
  }

  response.json({ data: template });
});

export { templateRoutes };
