import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import { VALID_SORT_FIELDS } from "./preorder.constants";
import { generateOrderNumber, getPagination } from "./preorder.utils";
import {
  normalizePreorderPayload,
  normalizeStatus,
  parsePreorderId,
} from "./preorder.validation";

import type {
  PreorderPayload,
  PreorderRecord,
  SortField,
  SortOrder,
} from "./preorder.types";
import { notFound } from "next/navigation";
import { validationError } from "@/errors/api-error";

// Query-string status values accepted by the list endpoint.
type StatusFilter = "active" | "inactive";

// Shared Prisma include for every response that needs status details.
const PREORDER_WITH_STATUS = {
  status: true,
} as const;

// Keep public sort names aligned with the UI while passing database field names to Prisma.
const SORT_FIELD_MAP: Record<SortField, keyof PreorderRecord> = {
  name: "name",
  products: "products",
  preorderWhen: "preorderWhen",
  startsAt: "startsAt",
  endsAt: "endsAt",
  createdAt: "createdAt",
};

const isStatusFilter = (value: string): value is StatusFilter => {
  return value === "active" || value === "inactive";
};

// Guard URL sort fields before using them in Prisma orderBy.
const isSortField = (value: string): value is SortField => {
  return (VALID_SORT_FIELDS as readonly string[]).includes(value);
};

// Normalize list sorting from URL params into safe defaults.
const getSortParams = (searchParams: URLSearchParams) => {
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

// Convert the status tab into Prisma where input.
const getStatusWhere = (status: string): Prisma.PreorderWhereInput => {
  if (!isStatusFilter(status)) {
    return {};
  }

  return {
    status: {
      name: status,
    },
  };
};

// Build a Prisma orderBy object from the public sort field names.
const getOrderBy = (
  field: SortField,
  direction: SortOrder,
): Prisma.PreorderOrderByWithRelationInput => {
  return {
    [SORT_FIELD_MAP[field]]: direction,
  } as Prisma.PreorderOrderByWithRelationInput;
};

// Keep casts centralized while Prisma Client catches up with schema changes.
const castPreorder = (preorder: unknown) => {
  // Prisma client types can lag behind schema edits until `prisma generate` is run.
  return preorder as PreorderRecord;
};

// Resolve the form's canonical status ids to the actual database status row.
const resolveStatusId = async (statusId: string) => {
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

// Shape database records into the API response used by the React components.
const toPreorderResponse = (preorder: PreorderRecord) => {
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

// Common lookup helper for get/update/delete flows.
const getPreorderOrThrow = async (id: string) => {
  const preorder = await prisma.preorder.findUnique({
    where: { id },
    include: PREORDER_WITH_STATUS,
  });

  if (!preorder) {
    notFound();
  }

  return castPreorder(preorder);
};

export const preorderService = {
  // Fetch filtered, sorted, paginated preorders for the table view.
  async list(searchParams: URLSearchParams) {
    const status = searchParams.get("status") || "all";
    const { page, perPage, skip, take } = getPagination(searchParams);
    const where = getStatusWhere(status);
    const sort = getSortParams(searchParams);

    const [data, total] = await Promise.all([
      prisma.preorder.findMany({
        where,
        orderBy: getOrderBy(sort.field, sort.direction),
        skip,
        take,
        include: PREORDER_WITH_STATUS,
      }),

      prisma.preorder.count({
        where,
      }),
    ]);

    return {
      data: data.map((preorder) => toPreorderResponse(castPreorder(preorder))),
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    };
  },

  // Create a preorder from normalized form data and assign a generated order number.
  async create(payload: PreorderPayload) {
    const data = normalizePreorderPayload(payload);
    const orderNumber = await generateOrderNumber();
    const statusId = await resolveStatusId(data.statusId);

    const preorder = await prisma.preorder.create({
      data: {
        ...data,
        statusId,
        orderNumber,
      } as unknown as Prisma.PreorderUncheckedCreateInput,
      include: PREORDER_WITH_STATUS,
    });

    return toPreorderResponse(castPreorder(preorder));
  },

  // get a single preorder for edit page hydration.
  async getById(id: string) {
    const preorderId = parsePreorderId(id);
    const preorder = await getPreorderOrThrow(preorderId);

    return toPreorderResponse(preorder);
  },

  // Update the preorder fields while preserving generated fields.
  async update(id: string, payload: PreorderPayload) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    const data = normalizePreorderPayload(payload);
    const statusId = await resolveStatusId(data.statusId);

    const preorder = await prisma.preorder.update({
      where: { id: preorderId },
      data: {
        ...data,
        statusId,
      } as unknown as Prisma.PreorderUncheckedUpdateInput,
      include: PREORDER_WITH_STATUS,
    });

    return toPreorderResponse(castPreorder(preorder));
  },

  // Update Status.
  async updateStatus(id: string, status: unknown) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    const normalizedStatus = normalizeStatus(status);

    const statusRecord = await prisma.status.findUnique({
      where: { name: normalizedStatus },
    });

    if (!statusRecord) {
      throw new Error("Status not found");
    }

    const preorder = await prisma.preorder.update({
      where: { id: preorderId },
      data: {
        statusId: statusRecord.id,
      },
      include: PREORDER_WITH_STATUS,
    });

    return toPreorderResponse(castPreorder(preorder));
  },

  // Delete after confirming the preorder exists, so missing ids return 404.
  async delete(id: string) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    await prisma.preorder.delete({
      where: { id: preorderId },
    });

    return {
      success: true,
      message: "Preorder deleted successfully",
    };
  },
};
