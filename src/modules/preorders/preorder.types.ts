export type PreorderStatus = "active" | "inactive";

export type SortOrder = "asc" | "desc";

export type SortField =
  | "orderNumber"
  | "customerName"
  | "product"
  | "price"
  | "quantity"
  | "createdAt";

export type Status = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PreorderWithStatus = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  product: string;
  quantity: number;
  price: number;
  statusId: string;
  status: Status;
  preorderWhen?: string;
  startsAt?: Date;
  endsAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PreorderPayload = {
  customerName?: unknown;
  email?: unknown;
  product?: unknown;
  quantity?: unknown;
  price?: unknown;
  statusId?: unknown;
  preorderWhen?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  notes?: unknown;
};
