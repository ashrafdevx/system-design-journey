import type { FastifyInstance } from "fastify";
import { AppError } from "../shared/errors/app-error.js";

function getClientErrorStatusCode(error: unknown) {
  if (!(error instanceof Error) || !("statusCode" in error)) return null;

  const statusCode = error.statusCode;
  return typeof statusCode === "number" && statusCode >= 400 && statusCode < 500
    ? statusCode
    : null;
}

export function configureErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply
        .code(error.statusCode)
        .send({ error: error.message, code: error.code });
    }

    const clientErrorStatusCode = getClientErrorStatusCode(error);
    const statusCode = clientErrorStatusCode ?? 500;

    if (statusCode === 500) {
      request.log.error({ err: error }, "Request failed.");
    }

    const message =
      statusCode !== 500 && error instanceof Error
        ? error.message
        : "Internal Server Error";
    return reply.code(statusCode).send({ error: message });
  });
}
