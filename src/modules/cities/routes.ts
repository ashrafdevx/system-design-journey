import type { FastifyPluginAsync } from "fastify";
import { findCity, listCities } from "./service.js";

export const cityRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ data: listCities() }));

  app.get<{ Params: { cityId: string } }>(
    "/:cityId",
    {
      schema: {
        params: {
          type: "object",
          required: ["cityId"],
          properties: { cityId: { type: "string", minLength: 1 } },
        },
      },
    },
    async (request, reply) => {
      const city = findCity(request.params.cityId);
      if (!city) {
        return reply.code(404).send({ error: "City not found" });
      }
      return { data: city };
    },
  );
};
