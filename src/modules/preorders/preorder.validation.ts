import { badRequest, validationError } from "@/errors/api-error";
import { VALID_STATUSES } from "./preorder.constants";
import type { PreorderPayload, PreorderStatus } from "./preorder.types";

/** Validate and trim preorder ID */
export const parsePreorderId = (id: string) => {
  if (typeof id !== "string" || !id.trim()) {
    throw badRequest("Invalid preorder id");
  }

  return id.trim();
};

/** Validate non-empty string and trim */
const toRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${field} is required`);
  }

  return value.trim();
};

/** Validate positive integer */
const toPositiveInteger = (value: unknown, field: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw validationError(`${field} must be a positive number`);
  }

  return parsed;
};

/** Validate optional date */
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

/** Normalize preorder status */
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

/** Normalize status ID */
export const normalizeStatusId = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return "active-id";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw validationError("Invalid status id");
};

/** Normalize and validate preorder payload */
export const normalizePreorderPayload = (payload: PreorderPayload) => {
  const name = toRequiredString(payload.name, "Name");
  const products = toPositiveInteger(payload.products, "Products");

  // Normalize form values for Prisma
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
