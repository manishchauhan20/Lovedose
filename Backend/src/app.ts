import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { proposalErrorHandler, proposalRoutes } from "./routes/proposal-routes.js";
import { siteStateErrorHandler, siteStateRoutes } from "./routes/site-state-routes.js";
import { templateRoutes } from "./routes/template-routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
    }),
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

  app.use("/api/templates", templateRoutes);
  app.use("/api/proposals", proposalRoutes);
  app.use("/api/site-state", siteStateRoutes);
  app.use(proposalErrorHandler);
  app.use(siteStateErrorHandler);

  return app;
}
