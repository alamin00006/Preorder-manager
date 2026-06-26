import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import { VALID_SORT_FIELDS } from "./preorder.constants";
import { generateOrderNumber, getPagination } from "./preorder.utils";
import {
  normalizePreorderPayload,
  normalizeStatus,
  normalizeStatusId,
  parsePreorderId,
} from "./preorder.validation";

import type { PreorderPayload, SortField, SortOrder } from "./preorder.types";
import { notFound } from "next/navigation";

async function getPreorderOrThrow(id: string | number) {
  const preorder = await prisma.preorder.findUnique({
    where: { id } as any,
  });

  if (!preorder) {
    throw notFound();
  }

  return preorder;
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

    const orderByDirection: SortOrder = sortOrder === "asc" ? "asc" : "desc";

    const [data, total] = await Promise.all([
      prisma.preorder.findMany({
        where,
        orderBy: {
          [orderByField]: orderByDirection,
        },
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
      data,
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
      },
    });
  },

  async getById(id: string) {
    const preorderId = parsePreorderId(id);
    return getPreorderOrThrow(preorderId);
  },

  async update(id: string, payload: PreorderPayload) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    const data = normalizePreorderPayload(payload);

    return prisma.preorder.update({
      where: { id: preorderId } as any,
      data,
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
      where: { id: preorderId } as any,
      data: {
        statusId: statusRecord.id,
      },
    });
  },

  async delete(id: string) {
    const preorderId = parsePreorderId(id);

    await getPreorderOrThrow(preorderId);

    await prisma.preorder.delete({
      where: { id: preorderId } as any,
    });

    return {
      success: true,
      message: "Preorder deleted successfully",
    };
  },
};
