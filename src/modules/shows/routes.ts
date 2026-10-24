import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { parseObjectId } from "../../shared/utils/object-id.js";
import {
  createShow,
  deleteShow,
  findShow,
  listShows,
  updateShow,
} from "./service.js";
import type { ShowInput } from "./types.js";

type ShowQuery = { cityId?: string; cinemaId?: string };

const showBodySchema = {
  type: "object",
  required: [
    "movieTitle",
    "cinemaId",
    "cityId",
    "startsAt",
    "language",
    "format",
  ],
  additionalProperties: false,
  properties: {
    movieTitle: { type: "string", minLength: 1, maxLength: 200 },
    cinemaId: { type: "string", minLength: 1 },
    cityId: { type: "string", minLength: 1 },
    startsAt: { type: "string", format: "date-time" },
    language: { type: "string", minLength: 1, maxLength: 80 },
    format: { type: "string", minLength: 1, maxLength: 80 },
  },
} as const;

const showParamsSchema = {
  type: "object",
  required: ["showId"],
  properties: { showId: { type: "string", minLength: 1 } },
} as const;

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
      },
    },
    async (request) => {
      const filters = {
        ...(request.query.cityId
          ? { cityId: parseObjectId(request.query.cityId, "cityId") }
          : {}),
        ...(request.query.cinemaId
          ? { cinemaId: parseObjectId(request.query.cinemaId, "cinemaId") }
          : {}),
      };
      return { data: await listShows(app.mongo, filters) };
    },
  );

  app.get<{ Params: { showId: string } }>(
    "/:showId",
    {
      schema: {
        tags: ["Shows"],
        summary: "Get a show",
        params: showParamsSchema,
      },
    },
    async (request) => {
      const show = await findShow(
        app.mongo,
        parseObjectId(request.params.showId, "showId"),
      );
      if (!show) throw new NotFoundError("Show");
      return { data: show };
    },
  );

  app.post<{ Body: ShowInput }>(
    "/",
    {
      schema: {
        tags: ["Shows"],
        summary: "Create a show",
        body: showBodySchema,
      },
    },
    async (request, reply) =>
      reply.code(201).send({ data: await createShow(app.mongo, request.body) }),
  );

  app.put<{ Params: { showId: string }; Body: ShowInput }>(
    "/:showId",
    {
      schema: {
        tags: ["Shows"],
        summary: "Replace a show",
        params: showParamsSchema,
        body: showBodySchema,
      },
    },
    async (request) => ({
      data: await updateShow(
        app.mongo,
        parseObjectId(request.params.showId, "showId"),
        request.body,
      ),
    }),
  );

  app.delete<{ Params: { showId: string } }>(
    "/:showId",
    {
      schema: {
        tags: ["Shows"],
        summary: "Delete a show",
        params: showParamsSchema,
      },
    },
    async (request, reply) => {
      await deleteShow(app.mongo, parseObjectId(request.params.showId, "showId"));
      return reply.code(204).send();
    },
  );
};
