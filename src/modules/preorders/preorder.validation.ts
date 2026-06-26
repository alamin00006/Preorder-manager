import { badRequest, validationError } from "@/errors/api-error";
import { VALID_STATUSES } from "./preorder.constants";
import type { PreorderPayload, PreorderStatus } from "./preorder.types";

export function parsePreorderId(id: string) {
  if (typeof id !== "string" || !id.trim()) {
    throw badRequest("Invalid preorder id");
  }

  return id.trim();
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

export function normalizeStatusId(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "active-id";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw validationError("Invalid status id");
}

export function normalizePreorderPayload(payload: PreorderPayload) {
  return {
    customerName: toRequiredString(payload.customerName, "Customer name"),
    email: toRequiredString(payload.email, "Email"),
    product: toRequiredString(payload.product, "Product"),
    quantity: toPositiveInteger(payload.quantity, "Quantity"),
    price: toNonNegativeNumber(payload.price, "Price"),
    statusId: normalizeStatusId(payload.statusId),
    preorderWhen:
      typeof payload.preorderWhen === "string" && payload.preorderWhen.trim()
        ? payload.preorderWhen.trim()
        : "regardless-of-stock",
    startsAt:
      typeof payload.startsAt === "string" && payload.startsAt.trim()
        ? new Date(payload.startsAt.trim())
        : null,
    endsAt:
      typeof payload.endsAt === "string" && payload.endsAt.trim()
        ? new Date(payload.endsAt.trim())
        : null,
    notes:
      typeof payload.notes === "string" && payload.notes.trim()
        ? payload.notes.trim()
        : null,
  };
}
