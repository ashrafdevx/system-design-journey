import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }
}
