import "dotenv/config";

function parsePort(value: string | undefined) {
  const fallbackPort = 4000;

  if (!value) {
    return fallbackPort;
  }

  const parsedPort = Number(value);
  return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : fallbackPort;
}

export const env = {
  port: parsePort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI ?? "",
};
