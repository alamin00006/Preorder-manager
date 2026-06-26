import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
} from "./preorder.constants";
import { internalError } from "@/errors/api-error";

function formatOrderDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export async function generateOrderNumber() {
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
}

export function getPagination(searchParams: URLSearchParams) {
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
}
