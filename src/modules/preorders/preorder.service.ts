import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import {
  PREORDER_WITH_STATUS,
  SORT_FIELD_MAP,
  castPreorder,
  generateOrderNumber,
  getOrderBy,
  getPreorderOrThrow,
  getSortParams,
  getStatusWhere,
  getPagination,
  resolveStatusId,
  toPreorderResponse,
} from "./preorder.utils";
import {
  normalizePreorderPayload,
  normalizeStatus,
  parsePreorderId,
} from "./preorder.validation";

import type { PreorderPayload } from "./preorder.types";

export const preorderService = {
  /**
   * Retrieves a paginated list of preorders with filtering and sorting capabilities.
   * @param searchParams - URL search parameters containing:
   *   - status: Filter by status name (default: "all")
   *   - page: Page number for pagination (default: 1)
   *   - perPage: Number of items per page (default: 10)
   *   - sort: Field name to sort by
   *   - direction: Sort direction ("asc" or "desc")
   *   - search: Optional search query for filtering
   * @returns Promise resolving to an object containing:
   *   - data: Array of preorder response objects
   *   - meta: Pagination metadata (total, page, perPage, totalPages)
   */
  list: async (searchParams: URLSearchParams) => {
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

  /**
   * Creates a new preorder record in the database.
   * @param payload - Preorder creation payload containing customer and order details
   * @returns Promise resolving to the created preorder response object
   * @throws {Error} If the payload validation fails or database operation fails
  
   */
  create: async (payload: PreorderPayload) => {
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

  /**
   * Retrieves a single preorder by its unique identifier.
   *
   * Parses and validates the ID, fetches the preorder with associated status,
   * and returns the formatted response. Throws an error if the preorder doesn't exist.
   *
   * @param id - The unique identifier of the preorder (can be UUID or order number)
   * @returns Promise resolving to the preorder response object
   * @throws {Error} If the ID format is invalid or preorder is not found
   *
   * @example
   * const preorder = await preorderService.getById("550e8400-e29b-41d4-a716-446655440000");
   */
  getById: async (id: string) => {
    const preorderId = parsePreorderId(id);
    const preorder = await getPreorderOrThrow(preorderId);

    return toPreorderResponse(preorder);
  },

  /**
   * Updates an existing preorder with new data.
   *
   * Validates the preorder exists, normalizes the update payload,
   * resolves the status ID, and updates the record in the database.
   * Returns the updated preorder with associated status data.
   *
   * @param id - The unique identifier of the preorder to update
   * @param payload - Partial preorder data containing fields to update
   * @returns Promise resolving to the updated preorder response object
   * @throws {Error} If the ID is invalid, preorder not found, or update fails
   *
   * @example
   * const updatedPreorder = await preorderService.update("550e8400-e29b-41d4-a716-446655440000", {
   *   quantity: 5,
   *   statusId: "new-status-uuid"
   * });
   */
  update: async (id: string, payload: PreorderPayload) => {
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

  /**
   * Updates the status of an existing preorder.
   *
   * Normalizes the status input, looks up the corresponding status record,
   * and updates the preorder's status ID. This method is specifically
   * designed for status transitions and workflow management.
   *
   * @param id - The unique identifier of the preorder to update
   * @param status - The new status value (will be normalized internally)
   * @returns Promise resolving to the updated preorder response object
   * @throws {Error} If the preorder is not found or the status doesn't exist in the database
   *
   * @example
   * const updatedPreorder = await preorderService.updateStatus(
   *   "550e8400-e29b-41d4-a716-446655440000",
   *   "completed"
   * );
   */
  updateStatus: async (id: string, status: unknown) => {
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

  /**
   * Permanently deletes a preorder from the database.
   *
   * Validates the preorder exists before deletion to prevent accidental
   * deletion of non-existent records. Returns a success confirmation
   * upon successful deletion.
   *
   * @param id - The unique identifier of the preorder to delete
   * @returns Promise resolving to a success response object
   * @throws {Error} If the ID is invalid or preorder is not found
   *
   * @example
   * const result = await preorderService.delete("550e8400-e29b-41d4-a716-446655440000");
   * // Returns: { success: true, message: "Preorder deleted successfully" }
   */
  delete: async (id: string) => {
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
