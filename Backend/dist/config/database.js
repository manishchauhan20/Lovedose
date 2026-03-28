"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
async function connectDatabase() {
    if (!env_js_1.env.mongodbUri) {
        throw new Error("MONGODB_URI is missing. Add your MongoDB connection string in Backend/.env");
    }
    await mongoose_1.default.connect(env_js_1.env.mongodbUri, {
        dbName: "LoveDose",
    });
}
