import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { findCinema, listCinemas } from "./service.js";

type CinemaQuery = { cityId?: string };

export const cinemaRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: CinemaQuery }>(
    "/",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "List cinemas",
        querystring: {
          type: "object",
          properties: { cityId: { type: "string", minLength: 1 } },
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "name", "cityId", "address"],
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    cityId: { type: "string" },
                    address: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request) => ({ data: listCinemas(request.query.cityId) }),
  );

  app.get<{ Params: { cinemaId: string } }>(
    "/:cinemaId",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "Get a cinema",
        params: {
          type: "object",
          required: ["cinemaId"],
          properties: { cinemaId: { type: "string", minLength: 1 } },
        },
        response: {
          200: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "object",
                required: ["id", "name", "cityId", "address"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  cityId: { type: "string" },
                  address: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            required: ["error", "code"],
            properties: {
              error: { type: "string" },
              code: { type: "string" },
            },
          },
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
