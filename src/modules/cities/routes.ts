import type { FastifyPluginAsync } from "fastify";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
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
    async (request) => {
      const city = findCity(request.params.cityId);
      if (!city) {
        throw new NotFoundError("City");
      }
      return { data: city };
    },
  );
};
