import Fastify from "fastify";
import { configureBootstrap } from "./bootstrap/index.js";
import { loadConfig } from "./bootstrap/config.js";
import { cinemaRoutes } from "./modules/cinemas/routes.js";
import { cityRoutes } from "./modules/cities/routes.js";
import { showRoutes } from "./modules/shows/routes.js";

export async function buildApp(config = loadConfig()) {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "*.password",
          "*.passwordHash",
          "*.token",
          "*.secret",
          "*.mongoUri",
        ],
        censor: "[REDACTED]",
      },
    },
  });

  await configureBootstrap(app, config);

  app.register(cityRoutes, { prefix: "/api/v1/cities" });
  app.register(cinemaRoutes, { prefix: "/api/v1/cinemas" });
  app.register(showRoutes, { prefix: "/api/v1/shows" });

  await app.ready();
  return app;
}
