export type AppErrorOptions = {
  code: string;
  statusCode: number;
};

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, options: AppErrorOptions) {
    if (
      !Number.isInteger(options.statusCode) ||
      options.statusCode < 400 ||
      options.statusCode >= 500
    ) {
      throw new RangeError("AppError statusCode must be an HTTP 4xx status.");
    }

    super(message);
    this.name = new.target.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
  }
}
