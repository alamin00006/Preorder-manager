import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import { VALID_SORT_FIELDS } from "./preorder.constants";
import { generateOrderNumber, getPagination } from "./preorder.utils";
import {
  normalizePreorderPayload,
  normalizeStatus,
  parsePreorderId,
} from "./preorder.validation";

import type { PreorderPayload, SortField, SortOrder } from "./preorder.types";
import { notFound } from "next/navigation";

type PreorderRecord = {
  id: string;
  orderNumber: string;
  name: string;
  products: number;
  statusId: string;
  status: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  preorderWhen: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const SORT_FIELD_MAP: Record<SortField, string> = {
  name: "name",
  products: "products",
  preorderWhen: "preorderWhen",
  startsAt: "startsAt",
  endsAt: "endsAt",
  createdAt: "createdAt",
};

function toPreorderResponse(preorder: PreorderRecord) {
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
}

async function getPreorderOrThrow(id: string | number) {
  const preorder = await prisma.preorder.findUnique({
    where: { id: String(id) },
    include: {
      status: true,
    },
  });

  if (!preorder) {
    throw notFound();
  }

  return preorder as unknown as PreorderRecord;
}

export const preorderService = {
  async list(searchParams: URLSearchParams) {
    const status = searchParams.get("status") || "all";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const { page, perPage, skip, take } = getPagination(searchParams);

    const where: Prisma.PreorderWhereInput = {};

    if (status === "active" || status === "inactive") {
      where.status = {
        name: status,
      };
    }

    const orderByField = VALID_SORT_FIELDS.includes(sortField as SortField)
      ? (sortField as SortField)
      : "createdAt";
    const prismaOrderByField = SORT_FIELD_MAP[orderByField];

    const orderByDirection: SortOrder = sortOrder === "asc" ? "asc" : "desc";

    const [data, total] = await Promise.all([
      prisma.preorder.findMany({
        where,
        orderBy: {
          [prismaOrderByField]: orderByDirection,
        } as Prisma.PreorderOrderByWithRelationInput,
        skip,
        take,
        include: {
          status: true,
        },
      }),

      prisma.preorder.count({
        where,
      }),
    ]);

    return {
      data: (data as unknown as PreorderRecord[]).map(toPreorderResponse),
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    };
  },

  async create(payload: PreorderPayload) {
    const data = normalizePreorderPayload(payload);
    const orderNumber = await generateOrderNumber();

    return prisma.preorder.create({
      data: {
        ...data,
        orderNumber,
      } as unknown as Prisma.PreorderUncheckedCreateInput,
    });
  },

  async getById(id: string) {
    const preorderId = parsePreorderId(id);
    const preorder = await getPreorderOrThrow(preorderId);

    return toPreorderResponse(preorder);
  },

  async update(id: string, payload: PreorderPayload) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    const data = normalizePreorderPayload(payload);

    return prisma.preorder.update({
      where: { id: preorderId },
      data: data as unknown as Prisma.PreorderUncheckedUpdateInput,
    });
  },

  async updateStatus(id: string, status: unknown) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    const normalizedStatus = normalizeStatus(status);

    // Find the status record by name
    const statusRecord = await prisma.status.findUnique({
      where: { name: normalizedStatus },
    });

    if (!statusRecord) {
      throw new Error("Status not found");
    }

    return prisma.preorder.update({
      where: { id: preorderId },
      data: {
        statusId: statusRecord.id,
      },
    });
  },

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
