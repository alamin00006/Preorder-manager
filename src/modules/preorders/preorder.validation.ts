import { badRequest, validationError } from "@/errors/api-error";
import { VALID_STATUSES } from "./preorder.constants";
import type { PreorderPayload, PreorderStatus } from "./preorder.types";

/**
 * Validates and normalizes a preorder ID from request parameters.
 *
 * @param id - The preorder ID string to validate
 * @returns The trimmed preorder ID
 * @throws {BadRequestError} If the ID is not a valid non-empty string
 *
 * @example
 * parsePreorderId(" 123 ") // returns "123"
 * parsePreorderId("") // throws BadRequestError
 */
export const parsePreorderId = (id: string) => {
  if (typeof id !== "string" || !id.trim()) {
    throw badRequest("Invalid preorder id");
  }

  return id.trim();
};

/**
 * Validates that a value is a non-empty string and normalizes it.
 *
 * @param value - The value to validate and convert
 * @param field - The field name for error messaging
 * @returns The trimmed string value
 * @throws {ValidationError} If the value is not a non-empty string
 *
 * @example
 * toRequiredString("  hello  ", "Name") // returns "hello"
 * toRequiredString("", "Name") // throws ValidationError
 * toRequiredString(123, "Name") // throws ValidationError
 */
const toRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${field} is required`);
  }

  return value.trim();
};

/**
 * Validates that a value is a positive integer and converts it.
 *
 * @param value - The value to validate and convert
 * @param field - The field name for error messaging
 * @returns The parsed positive integer
 * @throws {ValidationError} If the value is not a positive integer

 */
const toPositiveInteger = (value: unknown, field: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw validationError(`${field} must be a positive number`);
  }

  return parsed;
};

/**
 * Validates and normalizes an optional date value.
 * @param value - The date value to validate (string, Date, null, or undefined)
 * @param field - The field name for error messaging
 * @returns A Date object if valid, null if the input is empty/null/undefined
 * @throws {ValidationError} If the value is a non-empty string that cannot be parsed as a valid date
 */
const toOptionalDate = (
  value: string | Date | null | undefined,
  field: string,
) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value.trim());

  if (Number.isNaN(date.getTime())) {
    throw validationError(`${field} must be a valid date`);
  }

  return date;
};

/**
 * Normalizes a preorder status value to a valid PreorderStatus enum.
 * @param value - The status value to normalize (string, null, or undefined)
 * @returns A valid PreorderStatus value
 * @throws {ValidationError} If the value is not a valid status
 */
export const normalizeStatus = (value: unknown): PreorderStatus => {
  if (value === undefined || value === null || value === "") {
    return "active";
  }

  if (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as PreorderStatus)
  ) {
    return value as PreorderStatus;
  }

  throw validationError("Invalid status");
};

/**
 * Normalizes a status ID value for database operations.
 *
 * @param value - The status ID value to normalize (string, null, or undefined)
 * @returns A trimmed status ID string
 * @throws {ValidationError} If the value is not a valid non-empty string
 */
export const normalizeStatusId = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return "active-id";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw validationError("Invalid status id");
};

/**
 * Normalizes and validates a complete preorder payload from form submission.
 * @param payload - The raw preorder payload from form submission
 * @returns A normalized preorder object with validated and typed fields
 * @throws {ValidationError} If required fields are missing or invalid
 *
 */
export const normalizePreorderPayload = (payload: PreorderPayload) => {
  const name = toRequiredString(payload.name, "Name");
  const products = toPositiveInteger(payload.products, "Products");

  // Normalize browser form values into the exact nullable Date shape Prisma expects.
  return {
    name,
    products,
    statusId: normalizeStatusId(payload.statusId),
    preorderWhen:
      typeof payload.preorderWhen === "string" && payload.preorderWhen.trim()
        ? payload.preorderWhen.trim()
        : "regardless-of-stock",
    startsAt: toOptionalDate(payload.startsAt, "Starts at"),
    endsAt: toOptionalDate(payload.endsAt, "Ends at"),
    notes:
      typeof payload.notes === "string" && payload.notes.trim()
        ? payload.notes.trim()
        : null,
  };
};
