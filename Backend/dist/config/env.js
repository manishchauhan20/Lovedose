"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function parsePort(value) {
    const fallbackPort = 4000;
    if (!value) {
        return fallbackPort;
    }
    const parsedPort = Number(value);
    return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : fallbackPort;
}
exports.env = {
    port: parsePort(process.env.PORT),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    mongodbUri: process.env.MONGODB_URI ?? "",
};
