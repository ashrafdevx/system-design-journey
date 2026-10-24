import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config.js";
import { configureCors } from "./cors.js";
import { configureErrorHandler } from "./error-handler.js";
import { configureHealthRoute } from "./health.js";
import { configureHelmet } from "./helmet.js";
import { configureMongo } from "./mongo.js";
import { configureRateLimit } from "./rate-limit.js";
import { configureSwagger } from "./swagger.js";

export async function configureBootstrap(
  app: FastifyInstance,
  config: AppConfig,
) {
  await configureMongo(app, config);

  try {
    configureHelmet(app);
    configureCors(app, config);
    configureRateLimit(app, config);
    configureErrorHandler(app);
    configureSwagger(app, config);
    configureHealthRoute(app);
  } catch (error) {
    try {
      await app.close();
    } catch {
      app.log.error("Application cleanup failed after bootstrap initialization error.");
    }
    throw error;
  }
}
