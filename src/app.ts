import Fastify from "fastify";
import { cinemaRoutes } from "./modules/cinemas/routes.js";
import { cityRoutes } from "./modules/cities/routes.js";
import { showRoutes } from "./modules/shows/routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));
  app.register(cityRoutes, { prefix: "/api/v1/cities" });
  app.register(cinemaRoutes, { prefix: "/api/v1/cinemas" });
  app.register(showRoutes, { prefix: "/api/v1/shows" });

  return app;
}
