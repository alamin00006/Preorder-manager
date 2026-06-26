export type PreorderStatus = "active" | "inactive";

export type SortOrder = "asc" | "desc";

export type SortField =
  | "orderNumber"
  | "customerName"
  | "product"
  | "price"
  | "quantity"
  | "createdAt";

export type PreorderPayload = {
  customerName?: unknown;
  email?: unknown;
  product?: unknown;
  quantity?: unknown;
  price?: unknown;
  status?: unknown;
  notes?: unknown;
};
