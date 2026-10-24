import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { parseObjectId } from "../../shared/utils/object-id.js";
import {
  createCity,
  deleteCity,
  findCity,
  listCities,
  updateCity,
} from "./service.js";
import type { CityInput } from "./types.js";

const cityBodySchema = {
  type: "object",
  required: ["name", "state"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 120 },
    state: { type: "string", minLength: 1, maxLength: 120 },
  },
} as const;

const cityResponseSchema = {
  type: "object",
  required: ["id", "name", "state"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    state: { type: "string" },
  },
} as const;

const cityEnvelopeSchema = {
  type: "object",
  required: ["data"],
  properties: { data: cityResponseSchema },
} as const;

const cityIdParamsSchema = {
  type: "object",
  required: ["cityId"],
  properties: { cityId: { type: "string", minLength: 1 } },
} as const;

export const cityRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    { schema: { tags: ["Cities"], summary: "List cities" } },
    async () => ({ data: await listCities(app.mongo) }),
  );

  app.get<{ Params: { cityId: string } }>(
    "/:cityId",
    {
      schema: {
        tags: ["Cities"],
        summary: "Get a city",
        params: cityIdParamsSchema,
      },
    },
    async (request) => {
      const city = await findCity(app.mongo, parseObjectId(request.params.cityId, "cityId"));
      if (!city) {
        throw new NotFoundError("City");
      }
      return { data: city };
    },
  );

  app.post<{ Body: CityInput }>(
    "/",
    {
      schema: {
        tags: ["Cities"],
        summary: "Create a city",
        body: cityBodySchema,
        response: { 201: cityEnvelopeSchema },
      },
    },
    async (request, reply) =>
      reply.code(201).send({ data: await createCity(app.mongo, request.body) }),
  );

  app.put<{ Params: { cityId: string }; Body: CityInput }>(
    "/:cityId",
    {
      schema: {
        tags: ["Cities"],
        summary: "Replace a city",
        params: cityIdParamsSchema,
        body: cityBodySchema,
      },
    },
    async (request) => ({
      data: await updateCity(
        app.mongo,
        parseObjectId(request.params.cityId, "cityId"),
        request.body,
      ),
    }),
  );

  app.delete<{ Params: { cityId: string } }>(
    "/:cityId",
    {
      schema: {
        tags: ["Cities"],
        summary: "Delete a city",
        params: cityIdParamsSchema,
      },
    },
    async (request, reply) => {
      await deleteCity(app.mongo, parseObjectId(request.params.cityId, "cityId"));
      return reply.code(204).send();
    },
  );
};
