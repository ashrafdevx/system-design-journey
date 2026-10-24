import { MongoClient } from "mongodb";

export function createMongoClient(uri: string) {
  return new MongoClient(uri);
}
