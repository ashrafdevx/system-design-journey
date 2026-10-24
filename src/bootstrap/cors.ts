import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config.js";

export function configureCors(app: FastifyInstance, config: AppConfig) {
  app.register(cors, {
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : false,
  });
}
