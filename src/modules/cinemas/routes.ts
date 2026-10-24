import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { findCinema, listCinemas } from "./service.js";

type CinemaQuery = { cityId?: string };

export const cinemaRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: CinemaQuery }>(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: { cityId: { type: "string", minLength: 1 } },
          additionalProperties: false,
        },
      },
    },
    async (request) => ({ data: listCinemas(request.query.cityId) }),
  );

  app.get<{ Params: { cinemaId: string } }>(
    "/:cinemaId",
    {
      schema: {
        params: {
          type: "object",
          required: ["cinemaId"],
          properties: { cinemaId: { type: "string", minLength: 1 } },
        },
      },
    },
    async (request) => {
      const cinema = findCinema(request.params.cinemaId);
      if (!cinema) {
        throw new NotFoundError("Cinema");
      }
      return { data: cinema };
    },
  );
};
