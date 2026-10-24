import type { FastifyInstance } from "fastify";

export function configureHealthRoute(app: FastifyInstance) {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Check service and database health",
        response: {
          200: {
            type: "object",
            required: ["status", "database"],
            properties: {
              status: { type: "string", const: "ok" },
              database: { type: "string", const: "connected" },
            },
          },
          503: {
            type: "object",
            required: ["status", "database"],
            properties: {
              status: { type: "string", const: "unavailable" },
              database: { type: "string", const: "disconnected" },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        await app.mongo.command({ ping: 1 });
        return { status: "ok", database: "connected" };
      } catch (error) {
        app.log.error(
          { errorName: error instanceof Error ? error.name : "UnknownError" },
          "MongoDB health check failed.",
        );
        return reply
          .code(503)
          .send({ status: "unavailable", database: "disconnected" });
      }
    },
  );
}
