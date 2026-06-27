// Utility functions for preorder operations
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { validationError } from "@/errors/api-error";

import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  VALID_SORT_FIELDS,
} from "./preorder.constants";
import { internalError } from "@/errors/api-error";

import type {
  PreorderPayload,
  PreorderRecord,
  SortField,
  SortOrder,
} from "./preorder.types";

// Formats a date to YYYYMMDD string format
const formatOrderDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

// Generates a unique order number with ORD-YYYYMMDD-XXXXXX format
export const generateOrderNumber = async () => {
  const prefix = `ORD-${formatOrderDate()}`;

  const existingToday = await prisma.preorder.count({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
  });

  for (let offset = 1; offset <= 999999; offset += 1) {
    const sequence = String(existingToday + offset).padStart(6, "0");
    const orderNumber = `${prefix}-${sequence}`;

    const existing = await prisma.preorder.findUnique({
      where: { orderNumber },
    });

    if (!existing) return orderNumber;
  }

  throw internalError("Could not generate order number");
};

// Extracts and validates pagination parameters from URL search params
export const getPagination = (searchParams: URLSearchParams) => {
  const page = Math.max(
    Number(searchParams.get("page") || DEFAULT_PAGE),
    DEFAULT_PAGE,
  );

  const perPage = Math.min(
    Math.max(Number(searchParams.get("perPage") || DEFAULT_PER_PAGE), 1),
    MAX_PER_PAGE,
  );

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  };
};

// Status filter type for query parameters
export type StatusFilter = "active" | "inactive";

// Prisma include config for status details
export const PREORDER_WITH_STATUS = {
  status: true,
} as const;

// Maps UI sort fields to database fields
export const SORT_FIELD_MAP: Record<SortField, keyof PreorderRecord> = {
  name: "name",
  products: "products",
  preorderWhen: "preorderWhen",
  startsAt: "startsAt",
  endsAt: "endsAt",
  createdAt: "createdAt",
};

// Validates status filter value
export const isStatusFilter = (value: string): value is StatusFilter => {
  return value === "active" || value === "inactive";
};

// Validates sort field to prevent injection
export const isSortField = (value: string): value is SortField => {
  return (VALID_SORT_FIELDS as readonly string[]).includes(value);
};

// Extracts and validates sort parameters
export const getSortParams = (searchParams: URLSearchParams) => {
  const field = searchParams.get("sortField") || "createdAt";
  const order = searchParams.get("sortOrder");

  return {
    field: isSortField(field) ? field : "createdAt",
    direction: order === "asc" ? "asc" : "desc",
  } satisfies {
    field: SortField;
    direction: SortOrder;
  };
};

// Converts status filter to Prisma where clause
export const getStatusWhere = (status: string): Prisma.PreorderWhereInput => {
  if (!isStatusFilter(status)) {
    return {};
  }

  return {
    status: {
      name: status,
    },
  };
};

// Builds Prisma orderBy clause from sort params
export const getOrderBy = (
  field: SortField,
  direction: SortOrder,
): Prisma.PreorderOrderByWithRelationInput => {
  return {
    [SORT_FIELD_MAP[field]]: direction,
  } as Prisma.PreorderOrderByWithRelationInput;
};

// Type cast for Prisma query results
export const castPreorder = (preorder: unknown) => {
  return preorder as PreorderRecord;
};

// Resolves status ID from form input
export const resolveStatusId = async (statusId: string) => {
  const statusName =
    statusId === "inactive-id"
      ? "inactive"
      : statusId === "active-id"
        ? "active"
        : null;

  const status = statusName
    ? await prisma.status.findUnique({ where: { name: statusName } })
    : await prisma.status.findUnique({ where: { id: statusId } });

  if (!status) {
    throw validationError("Invalid preorder status");
  }

  return status.id;
};

// Formats preorder for API response
export const toPreorderResponse = (preorder: PreorderRecord) => {
  return {
    id: preorder.id,
    orderNumber: preorder.orderNumber,
    name: preorder.name,
    products: preorder.products,
    statusId: preorder.statusId,
    status: preorder.status,
    preorderWhen: preorder.preorderWhen,
    startsAt: preorder.startsAt,
    endsAt: preorder.endsAt,
    notes: preorder.notes,
    createdAt: preorder.createdAt,
    updatedAt: preorder.updatedAt,
  };
};

// Fetches preorder by ID or throws 404
export const getPreorderOrThrow = async (id: string) => {
  const preorder = await prisma.preorder.findUnique({
    where: { id },
    include: PREORDER_WITH_STATUS,
  });

  if (!preorder) {
    notFound();
  }

  return castPreorder(preorder);
};
