import helmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";

export function configureHelmet(app: FastifyInstance) {
  app.register(helmet);
}
