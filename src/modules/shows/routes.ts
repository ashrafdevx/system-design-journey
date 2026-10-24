import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { findShow, listShows } from "./service.js";

type ShowQuery = { cityId?: string; cinemaId?: string };

export const showRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ShowQuery }>(
    "/",
    {
      schema: {
        tags: ["Shows"],
        summary: "List shows",
        querystring: {
          type: "object",
          properties: {
            cityId: { type: "string", minLength: 1 },
            cinemaId: { type: "string", minLength: 1 },
          },
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
                  required: [
                    "id",
                    "movieTitle",
                    "cinemaId",
                    "cityId",
                    "startsAt",
                    "language",
                    "format",
                  ],
                  properties: {
                    id: { type: "string" },
                    movieTitle: { type: "string" },
                    cinemaId: { type: "string" },
                    cityId: { type: "string" },
                    startsAt: { type: "string", format: "date-time" },
                    language: { type: "string" },
                    format: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request) => ({ data: listShows(request.query) }),
  );

  app.get<{ Params: { showId: string } }>(
    "/:showId",
    {
      schema: {
        tags: ["Shows"],
        summary: "Get a show",
        params: {
          type: "object",
          required: ["showId"],
          properties: { showId: { type: "string", minLength: 1 } },
        },
        response: {
          200: {
            type: "object",
            required: [
              "data",
            ],
            properties: {
              data: {
                type: "object",
                required: [
                  "id",
                  "movieTitle",
                  "cinemaId",
                  "cityId",
                  "startsAt",
                  "language",
                  "format",
                ],
                properties: {
                  id: { type: "string" },
                  movieTitle: { type: "string" },
                  cinemaId: { type: "string" },
                  cityId: { type: "string" },
                  startsAt: { type: "string", format: "date-time" },
                  language: { type: "string" },
                  format: { type: "string" },
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
      const show = findShow(request.params.showId);
      if (!show) {
        throw new NotFoundError("Show");
      }
      return { data: show };
    },
  );
};
