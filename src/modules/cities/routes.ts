import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { findCity, listCities } from "./service.js";

export const cityRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    {
      schema: {
        tags: ["Cities"],
        summary: "List cities",
        response: {
          200: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "name", "state"],
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    state: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => ({ data: listCities() }),
  );

  app.get<{ Params: { cityId: string } }>(
    "/:cityId",
    {
      schema: {
        tags: ["Cities"],
        summary: "Get a city",
        params: {
          type: "object",
          required: ["cityId"],
          properties: { cityId: { type: "string", minLength: 1 } },
        },
        response: {
          200: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "object",
                required: ["id", "name", "state"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  state: { type: "string" },
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
      const city = findCity(request.params.cityId);
      if (!city) {
        throw new NotFoundError("City");
      }
      return { data: city };
    },
  );
};
