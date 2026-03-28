import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Love Proposal backend running on http://localhost:${env.port}`);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  });
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start backend";
  console.error(message);
  process.exit(1);
});
