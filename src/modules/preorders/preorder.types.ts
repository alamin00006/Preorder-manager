export type PreorderStatus = "active" | "inactive";

export type PreorderWhen = "regardless-of-stock" | "out-of-stock";

export type SortOrder = "asc" | "desc";

export type SortField =
  | "name"
  | "products"
  | "preorderWhen"
  | "startsAt"
  | "endsAt"
  | "createdAt";

export type Status = {
  id?: string;
  name: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type DateInput = string | Date | null;

export type PreorderWithStatus = {
  id: string;
  orderNumber: string;
  name: string;
  products: number;
  statusId: string;
  status: Status;
  preorderWhen?: PreorderWhen | string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PreorderPayload = {
  name?: string;
  products?: number | string;
  statusId?: string;
  preorderWhen?: PreorderWhen | string;
  startsAt?: DateInput;
  endsAt?: DateInput;
  notes?: string | null;
};

export interface Preorder {
  id: string;
  orderNumber: string;
  name: string;
  products: number;
  statusId: string;
  status?: Status;
  preorderWhen?: PreorderWhen | string | null;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PreorderListResponse {
  data: Preorder[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PreorderFormData {
  name: string;
  products: number;
  statusId: string;
  preorderWhen: PreorderWhen | string;
  startsAt: string;
  endsAt: string;
  notes: string;
}
