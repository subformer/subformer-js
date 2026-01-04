/**
 * Exceptions for Subformer SDK
 */

/** Base error for Subformer SDK */
export class SubformerError extends Error {
  readonly statusCode?: number;
  readonly code?: string;
  readonly data?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      data?: unknown;
    }
  ) {
    super(message);
    this.name = "SubformerError";
    this.statusCode = options?.statusCode;
    this.code = options?.code;
    this.data = options?.data;
  }
}

/** Raised when API authentication fails */
export class AuthenticationError extends SubformerError {
  constructor(message = "Invalid or missing API key") {
    super(message, { statusCode: 401, code: "UNAUTHORIZED" });
    this.name = "AuthenticationError";
  }
}

/** Raised when a resource is not found */
export class NotFoundError extends SubformerError {
  constructor(message = "Resource not found") {
    super(message, { statusCode: 404, code: "NOT_FOUND" });
    this.name = "NotFoundError";
  }
}

/** Raised when rate limit is exceeded */
export class RateLimitError extends SubformerError {
  constructor(message = "Rate limit exceeded") {
    super(message, { statusCode: 429, code: "RATE_LIMIT_EXCEEDED" });
    this.name = "RateLimitError";
  }
}

/** Raised when request validation fails */
export class ValidationError extends SubformerError {
  constructor(message: string, data?: unknown) {
    super(message, { statusCode: 400, code: "BAD_REQUEST", data });
    this.name = "ValidationError";
  }
}
