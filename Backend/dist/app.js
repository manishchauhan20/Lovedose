"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_js_1 = require("./config/env.js");
const proposal_routes_js_1 = require("./routes/proposal-routes.js");
const site_state_routes_js_1 = require("./routes/site-state-routes.js");
const template_routes_js_1 = require("./routes/template-routes.js");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_js_1.env.corsOrigin,
    }));
    app.use(express_1.default.json({ limit: "50mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
    app.get("/health", (_request, response) => {
        response.json({
            status: "ok",
            service: "love-proposal-backend",
            timestamp: new Date().toISOString(),
        });
    });
    app.get("/api", (_request, response) => {
        response.json({
            service: "love-proposal-backend",
            endpoints: {
                health: "GET /health",
                templates: "GET /api/templates",
                templateById: "GET /api/templates/:id",
                proposals: "GET /api/proposals",
                proposalById: "GET /api/proposals/:id",
                createProposal: "POST /api/proposals",
                updateProposal: "PUT /api/proposals/:id",
                deleteProposal: "DELETE /api/proposals/:id",
                siteStateOverview: "GET /api/site-state/overview",
            },
        });
    });
    app.use("/api/templates", template_routes_js_1.templateRoutes);
    app.use("/api/proposals", proposal_routes_js_1.proposalRoutes);
    app.use("/api/site-state", site_state_routes_js_1.siteStateRoutes);
    app.use(proposal_routes_js_1.proposalErrorHandler);
    app.use(site_state_routes_js_1.siteStateErrorHandler);
    return app;
}
