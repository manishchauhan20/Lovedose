"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRoutes = void 0;
const express_1 = require("express");
const proposal_js_1 = require("../models/proposal.js");
const template_js_1 = require("../models/template.js");
const templateRoutes = (0, express_1.Router)();
exports.templateRoutes = templateRoutes;
templateRoutes.get("/", (request, response) => {
    const relationshipTypeParam = request.query.relationshipType;
    if (!relationshipTypeParam) {
        response.json({ data: template_js_1.proposalTemplates });
        return;
    }
    const parsedRelationshipType = proposal_js_1.relationshipTypeSchema.safeParse(relationshipTypeParam);
    if (!parsedRelationshipType.success) {
        response.status(400).json({
            message: "Invalid relationshipType query parameter",
            expected: proposal_js_1.relationshipTypeSchema.options,
        });
        return;
    }
    const filteredTemplates = template_js_1.proposalTemplates.filter((template) => template.relationshipType === parsedRelationshipType.data);
    response.json({ data: filteredTemplates });
});
templateRoutes.get("/:id", (request, response) => {
    const template = template_js_1.proposalTemplates.find((item) => item.id === request.params.id);
    if (!template) {
        response.status(404).json({ message: "Template not found" });
        return;
    }
    response.json({ data: template });
});
