export type ApiError = {
  name: "ApiError";
  message: string;
  status: number;
};

export function createApiError(message: string, status = 400): ApiError {
  return {
    name: "ApiError",
    message,
    status,
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "status" in error &&
    error.name === "ApiError"
  );
}

export const badRequest = (message = "Bad request") =>
  createApiError(message, 400);
export const notFound = (message = "Resource not found") =>
  createApiError(message, 404);
export const validationError = (message = "Validation failed") =>
  createApiError(message, 422);
export const internalError = (message = "Internal server error") =>
  createApiError(message, 500);
