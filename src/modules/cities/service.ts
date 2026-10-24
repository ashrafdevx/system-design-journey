import { ObjectId, type Collection, type Db } from "mongodb";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import type { City, CityInput } from "./types.js";

type CityDocument = CityInput & { _id: ObjectId };

function collection(db: Db): Collection<CityDocument> {
  return db.collection<CityDocument>("cities");
}

function toCity(document: CityDocument): City {
  return { id: document._id.toHexString(), name: document.name, state: document.state };
}

export async function listCities(db: Db) {
  const documents = await collection(db).find().sort({ name: 1 }).toArray();
  return documents.map(toCity);
}

export async function findCity(db: Db, id: ObjectId) {
  const document = await collection(db).findOne({ _id: id });
  return document ? toCity(document) : null;
}

export async function createCity(db: Db, input: CityInput) {
  const result = await collection(db).insertOne({ ...input, _id: new ObjectId() });
  const city = await findCity(db, result.insertedId);
  if (!city) throw new Error("Created city could not be read back.");
  return city;
}

export async function updateCity(db: Db, id: ObjectId, input: CityInput) {
  const result = await collection(db).updateOne({ _id: id }, { $set: input });
  if (result.matchedCount === 0) throw new NotFoundError("City");
  const city = await findCity(db, id);
  if (!city) throw new Error("Updated city could not be read back.");
  return city;
}

export async function deleteCity(db: Db, id: ObjectId) {
  const cities = collection(db);
  if (!(await cities.findOne({ _id: id }))) throw new NotFoundError("City");

  const relatedCount =
    (await db.collection("cinemas").countDocuments({ cityId: id.toHexString() })) +
    (await db.collection("shows").countDocuments({ cityId: id.toHexString() }));
  if (relatedCount > 0) {
    throw new ConflictError("Cannot delete a city that still has cinemas or shows.");
  }

  await cities.deleteOne({ _id: id });
}
