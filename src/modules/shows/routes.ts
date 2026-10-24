import type { FastifyPluginAsync } from "fastify";
import { findShow, listShows } from "./service.js";

type ShowQuery = { cityId?: string; cinemaId?: string };

export const showRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ShowQuery }>(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            cityId: { type: "string", minLength: 1 },
            cinemaId: { type: "string", minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => ({ data: listShows(request.query) }),
  );

  app.get<{ Params: { showId: string } }>(
    "/:showId",
    {
      schema: {
        params: {
          type: "object",
          required: ["showId"],
          properties: { showId: { type: "string", minLength: 1 } },
        },
      },
    },
    async (request, reply) => {
      const show = findShow(request.params.showId);
      if (!show) {
        return reply.code(404).send({ error: "Show not found" });
      }
      return { data: show };
    },
  );
};
