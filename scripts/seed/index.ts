import { ObjectId } from "mongodb";
import { createMongoClient } from "../../src/integrations/mongodb/client.js";
import { loadConfig } from "../../src/bootstrap/config.js";
import { cinemas, cities, shows } from "./data.js";

async function seed() {
  const config = loadConfig();
  const client = createMongoClient(config.mongoUri);

  try {
    await client.connect();
    const db = client.db(config.databaseName);

    for (const city of cities) {
      const { id, ...fields } = city;
      await db.collection("cities").updateOne(
        { _id: new ObjectId(id) },
        { $set: fields },
        { upsert: true },
      );
    }

    for (const cinema of cinemas) {
      const { id, cityId, ...fields } = cinema;
      await db.collection("cinemas").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...fields, cityId } },
        { upsert: true },
      );
    }

    for (const show of shows) {
      const { id, startsAt, ...fields } = show;
      await db.collection("shows").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...fields,
            startsAt: new Date(startsAt),
          },
        },
        { upsert: true },
      );
    }

    console.info(
      `Seeded ${cities.length} cities, ${cinemas.length} cinemas, and ${shows.length} shows into database "${config.databaseName}".`,
    );
  } finally {
    await client.close();
  }
}

seed().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`Database seeding failed (${errorName}).`);
  process.exitCode = 1;
});
