import { ObjectId, type Collection, type Db } from "mongodb";
import { parseObjectId } from "../../shared/utils/object-id.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import type { Cinema, CinemaInput } from "./types.js";

type CinemaDocument = CinemaInput & { _id: ObjectId };

function collection(db: Db): Collection<CinemaDocument> {
  return db.collection<CinemaDocument>("cinemas");
}

function toCinema(document: CinemaDocument): Cinema {
  return {
    id: document._id.toHexString(),
    name: document.name,
    cityId: document.cityId,
    address: document.address,
  };
}

async function ensureCityExists(db: Db, cityId: string) {
  const parsedCityId = parseObjectId(cityId, "cityId");
  const city = await db.collection("cities").findOne({ _id: parsedCityId });
  if (!city) throw new NotFoundError("City");
}

export async function listCinemas(db: Db, cityId?: ObjectId) {
  const documents = await collection(db)
    .find(cityId ? { cityId: cityId.toHexString() } : {})
    .sort({ name: 1 })
    .toArray();
  return documents.map(toCinema);
}

export async function findCinema(db: Db, id: ObjectId) {
  const document = await collection(db).findOne({ _id: id });
  return document ? toCinema(document) : null;
}

export async function createCinema(db: Db, input: CinemaInput) {
  await ensureCityExists(db, input.cityId);
  const result = await collection(db).insertOne({ ...input, _id: new ObjectId() });
  const cinema = await findCinema(db, result.insertedId);
  if (!cinema) throw new Error("Created cinema could not be read back.");
  return cinema;
}

export async function updateCinema(db: Db, id: ObjectId, input: CinemaInput) {
  await ensureCityExists(db, input.cityId);
  const cinemas = collection(db);
  const existing = await cinemas.findOne({ _id: id });
  if (!existing) throw new NotFoundError("Cinema");

  if (
    existing.cityId !== input.cityId &&
    (await db.collection("shows").countDocuments({ cinemaId: id.toHexString() })) > 0
  ) {
    throw new ConflictError("Cannot move a cinema to another city while it has shows.");
  }

  const result = await cinemas.updateOne({ _id: id }, { $set: input });
  if (result.matchedCount === 0) throw new NotFoundError("Cinema");
  const cinema = await findCinema(db, id);
  if (!cinema) throw new Error("Updated cinema could not be read back.");
  return cinema;
}

export async function deleteCinema(db: Db, id: ObjectId) {
  const cinemas = collection(db);
  if (!(await cinemas.findOne({ _id: id }))) throw new NotFoundError("Cinema");

  if (await db.collection("shows").countDocuments({ cinemaId: id.toHexString() })) {
    throw new ConflictError("Cannot delete a cinema that still has shows.");
  }

  await cinemas.deleteOne({ _id: id });
}
