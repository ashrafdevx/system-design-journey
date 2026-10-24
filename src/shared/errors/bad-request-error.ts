import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, { code: "BAD_REQUEST", statusCode: 400 });
  }
}
