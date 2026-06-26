import type { PreorderStatus, SortField } from "./preorder.types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 10;
export const MAX_PER_PAGE = 50;

export const VALID_STATUSES: PreorderStatus[] = ["active", "inactive"];

export const VALID_SORT_FIELDS: SortField[] = [
  "orderNumber",
  "customerName",
  "product",
  "price",
  "quantity",
  "createdAt",
];
