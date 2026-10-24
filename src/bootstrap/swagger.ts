import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config.js";

export function configureSwagger(app: FastifyInstance, config: AppConfig) {
  if (!config.swaggerEnabled) return;

  app.register(swagger, {
    openapi: {
      info: {
        title: "BookMyShow API",
        description: "API documentation for cities, cinemas, and show listings.",
        version: "1.0.0",
      },
      tags: [
        { name: "Health", description: "Application health" },
        { name: "Cities", description: "City listings" },
        { name: "Cinemas", description: "Cinema listings" },
        { name: "Shows", description: "Show listings" },
      ],
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
}
