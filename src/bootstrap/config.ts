const logLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"];

export type AppConfig = {
  mongoUri: string;
  databaseName: string;
  corsOrigins: string[];
  logLevel: string;
  host: string;
  port: number;
  rateLimitEnabled: boolean;
  rateLimitMax: number;
  rateLimitWindow: number;
  swaggerEnabled: boolean;
};

function readBoolean(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;

  const normalized = value.toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`${name} must be either true or false.`);
}

function readPositiveInteger(name: string, fallback: number) {
  const value = process.env[name];
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function validateMongoUri(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("MONGODB_URI must be a valid MongoDB connection URL.");
  }

  if (parsed.protocol !== "mongodb:" && parsed.protocol !== "mongodb+srv:") {
    throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://.");
  }
}

function readCorsOrigins() {
  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("Each CORS_ORIGINS entry must be a valid origin URL.");
    }

    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error("CORS_ORIGINS entries must be HTTP(S) origins without paths.");
    }
  }

  return origins;
}

export function loadConfig(): AppConfig {
  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DATABASE;
  if (!mongoUri || !databaseName) {
    throw new Error("MONGODB_URI and MONGODB_DATABASE must be configured.");
  }
  validateMongoUri(mongoUri);

  const logLevel = process.env.LOG_LEVEL ?? "info";
  if (!logLevels.includes(logLevel)) {
    throw new Error("LOG_LEVEL must be a supported Pino log level.");
  }

  const port = readPositiveInteger("PORT", 3000);
  if (port > 65535) {
    throw new Error("PORT must be between 1 and 65535.");
  }

  const rateLimitEnabled = readBoolean("RATE_LIMIT_ENABLED", true);
  if (!rateLimitEnabled && process.env.NODE_ENV === "production") {
    throw new Error("RATE_LIMIT_ENABLED cannot be false in production.");
  }

  return {
    mongoUri,
    databaseName,
    corsOrigins: readCorsOrigins(),
    logLevel,
    host: process.env.HOST ?? "0.0.0.0",
    port,
    rateLimitEnabled,
    rateLimitMax: readPositiveInteger("RATE_LIMIT_MAX", 100),
    rateLimitWindow: readPositiveInteger("RATE_LIMIT_WINDOW_MS", 60_000),
    swaggerEnabled: process.env.NODE_ENV !== "production",
  };
}
