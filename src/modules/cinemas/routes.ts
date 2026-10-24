import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { parseObjectId } from "../../shared/utils/object-id.js";
import {
  createCinema,
  deleteCinema,
  findCinema,
  listCinemas,
  updateCinema,
} from "./service.js";
import type { CinemaInput } from "./types.js";

type CinemaQuery = { cityId?: string };

const cinemaBodySchema = {
  type: "object",
  required: ["name", "cityId", "address"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 160 },
    cityId: { type: "string", minLength: 1 },
    address: { type: "string", minLength: 1, maxLength: 300 },
  },
} as const;

const cinemaParamsSchema = {
  type: "object",
  required: ["cinemaId"],
  properties: { cinemaId: { type: "string", minLength: 1 } },
} as const;

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
      },
    },
    async (request) => ({
      data: await listCinemas(
        app.mongo,
        request.query.cityId ? parseObjectId(request.query.cityId, "cityId") : undefined,
      ),
    }),
  );

  app.get<{ Params: { cinemaId: string } }>(
    "/:cinemaId",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "Get a cinema",
        params: cinemaParamsSchema,
      },
    },
    async (request) => {
      const cinema = await findCinema(
        app.mongo,
        parseObjectId(request.params.cinemaId, "cinemaId"),
      );
      if (!cinema) throw new NotFoundError("Cinema");
      return { data: cinema };
    },
  );

  app.post<{ Body: CinemaInput }>(
    "/",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "Create a cinema",
        body: cinemaBodySchema,
      },
    },
    async (request, reply) =>
      reply.code(201).send({ data: await createCinema(app.mongo, request.body) }),
  );

  app.put<{ Params: { cinemaId: string }; Body: CinemaInput }>(
    "/:cinemaId",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "Replace a cinema",
        params: cinemaParamsSchema,
        body: cinemaBodySchema,
      },
    },
    async (request) => ({
      data: await updateCinema(
        app.mongo,
        parseObjectId(request.params.cinemaId, "cinemaId"),
        request.body,
      ),
    }),
  );

  app.delete<{ Params: { cinemaId: string } }>(
    "/:cinemaId",
    {
      schema: {
        tags: ["Cinemas"],
        summary: "Delete a cinema",
        params: cinemaParamsSchema,
      },
    },
    async (request, reply) => {
      await deleteCinema(
        app.mongo,
        parseObjectId(request.params.cinemaId, "cinemaId"),
      );
      return reply.code(204).send();
    },
  );
};
