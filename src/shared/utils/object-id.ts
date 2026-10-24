import { ObjectId } from "mongodb";
import { BadRequestError } from "../errors/bad-request-error.js";

export function parseObjectId(value: string, name = "id") {
  if (!ObjectId.isValid(value)) {
    throw new BadRequestError(`${name} must be a valid MongoDB ObjectId.`);
  }
  return new ObjectId(value);
}
