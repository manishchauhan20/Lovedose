"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_js_1 = require("./app.js");
const database_js_1 = require("./config/database.js");
const env_js_1 = require("./config/env.js");
const app = (0, app_js_1.createApp)();
async function startServer() {
    await (0, database_js_1.connectDatabase)();
    app.listen(env_js_1.env.port, () => {
        console.log(`Love Proposal backend running on http://localhost:${env_js_1.env.port}`);
        console.log(`MongoDB connected: ${mongoose_1.default.connection.name}`);
    });
}
startServer().catch((error) => {
    const message = error instanceof Error ? error.message : "Failed to start backend";
    console.error(message);
    process.exit(1);
});
