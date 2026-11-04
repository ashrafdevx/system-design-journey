import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config.js";

export function configureRateLimit(app: FastifyInstance, config: AppConfig) {
  if (!config.rateLimitEnabled) {
    app.log.warn("Rate limiting is disabled.");
    return;
  }

  app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
  });
}
