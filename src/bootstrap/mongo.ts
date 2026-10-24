import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config.js";
import { createMongoClient } from "../integrations/mongodb/client.js";

export async function configureMongo(app: FastifyInstance, config: AppConfig) {
  const client = createMongoClient(config.mongoUri);

  try {
    await client.connect();
  } catch {
    app.log.error("MongoDB connection failed; check configuration and network access.");
    try {
      await client.close();
    } catch {
      app.log.error("MongoDB client cleanup failed after connection failure.");
    }
    throw new Error("Could not connect to MongoDB.");
  }

  app.decorate("mongo", client.db(config.databaseName));
  app.addHook("onClose", async () => {
    await client.close();
  });
}
