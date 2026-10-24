import { ObjectId, type Collection, type Db } from "mongodb";
import { BadRequestError } from "../../shared/errors/bad-request-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { parseObjectId } from "../../shared/utils/object-id.js";
import type { Show, ShowInput } from "./types.js";

type ShowDocument = Omit<ShowInput, "startsAt"> & {
  _id: ObjectId;
  startsAt: Date;
};

type ShowFilters = {
  cityId?: ObjectId;
  cinemaId?: ObjectId;
};

function collection(db: Db): Collection<ShowDocument> {
  return db.collection<ShowDocument>("shows");
}

function toShow(document: ShowDocument): Show {
  return {
    id: document._id.toHexString(),
    movieTitle: document.movieTitle,
    cinemaId: document.cinemaId,
    cityId: document.cityId,
    startsAt: document.startsAt.toISOString(),
    language: document.language,
    format: document.format,
  };
}

async function ensureRelationsExist(db: Db, input: ShowInput) {
  const cityId = parseObjectId(input.cityId, "cityId");
  const cinemaId = parseObjectId(input.cinemaId, "cinemaId");
  const [city, cinema] = await Promise.all([
    db.collection("cities").findOne({ _id: cityId }),
    db.collection("cinemas").findOne({ _id: cinemaId }),
  ]);

  if (!city) throw new NotFoundError("City");
  if (!cinema) throw new NotFoundError("Cinema");
  if (cinema.cityId !== input.cityId) {
    throw new NotFoundError("Cinema in the specified city");
  }
}

function toDocument(input: ShowInput): Omit<ShowDocument, "_id"> {
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    throw new BadRequestError("startsAt must be a valid date-time.");
  }
  return { ...input, startsAt };
}

export async function listShows(db: Db, filters: ShowFilters) {
  const query: Record<string, unknown> = {};
  if (filters.cityId) query.cityId = filters.cityId.toHexString();
  if (filters.cinemaId) query.cinemaId = filters.cinemaId.toHexString();

  const documents = await collection(db)
    .find(query)
    .sort({ startsAt: 1 })
    .toArray();
  return documents.map(toShow);
}

export async function findShow(db: Db, id: ObjectId) {
  const document = await collection(db).findOne({ _id: id });
  return document ? toShow(document) : null;
}

export async function createShow(db: Db, input: ShowInput) {
  await ensureRelationsExist(db, input);
  const document = { ...toDocument(input), _id: new ObjectId() };
  const result = await collection(db).insertOne(document);
  const show = await findShow(db, result.insertedId);
  if (!show) throw new Error("Created show could not be read back.");
  return show;
}

export async function updateShow(db: Db, id: ObjectId, input: ShowInput) {
  await ensureRelationsExist(db, input);
  const result = await collection(db).updateOne({ _id: id }, { $set: toDocument(input) });
  if (result.matchedCount === 0) throw new NotFoundError("Show");
  const show = await findShow(db, id);
  if (!show) throw new Error("Updated show could not be read back.");
  return show;
}

export async function deleteShow(db: Db, id: ObjectId) {
  const result = await collection(db).deleteOne({ _id: id });
  if (result.deletedCount === 0) throw new NotFoundError("Show");
}
