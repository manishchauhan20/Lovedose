import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error(
      "MONGODB_URI is missing. Add your MongoDB connection string in Backend/.env",
    );
  }

  await mongoose.connect(env.mongodbUri, {
    dbName: "LoveDose",
  });
}
