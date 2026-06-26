import { badRequest, validationError } from "@/errors/api-error";
import { VALID_STATUSES } from "./preorder.constants";
import type { PreorderPayload, PreorderStatus } from "./preorder.types";

export function parsePreorderId(id: string) {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw badRequest("Invalid preorder id");
  }

  return parsed;
}

function toRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${field} is required`);
  }

  return value.trim();
}

function toPositiveInteger(value: unknown, field: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw validationError(`${field} must be a positive number`);
  }

  return parsed;
}

function toNonNegativeNumber(value: unknown, field: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw validationError(`${field} must be zero or greater`);
  }

  return parsed;
}

export function normalizeStatus(value: unknown): PreorderStatus {
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
}

export function normalizePreorderPayload(payload: PreorderPayload) {
  return {
    customerName: toRequiredString(payload.customerName, "Customer name"),
    email: toRequiredString(payload.email, "Email"),
    product: toRequiredString(payload.product, "Product"),
    quantity: toPositiveInteger(payload.quantity, "Quantity"),
    price: toNonNegativeNumber(payload.price, "Price"),
    status: normalizeStatus(payload.status),
    notes:
      typeof payload.notes === "string" && payload.notes.trim()
        ? payload.notes.trim()
        : null,
  };
}
