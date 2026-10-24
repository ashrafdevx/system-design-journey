import type { FastifyInstance } from "fastify";

export function configureHealthRoute(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
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
  });
}
