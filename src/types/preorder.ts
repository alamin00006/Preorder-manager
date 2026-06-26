export type PreorderStatus = "active" | "inactive";

export type SortField =
  | "orderNumber"
  | "customerName"
  | "product"
  | "price"
  | "quantity"
  | "createdAt";
export type SortOrder = "asc" | "desc";

export interface Status {
  id?: string;
  name: PreorderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Preorder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  product: string;
  quantity: number;
  price: number;
  statusId: string;
  status?: Status;
  preorderWhen?: string;
  startsAt?: string;
  endsAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreorderListResponse {
  data: Preorder[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PreorderFormData {
  orderNumber: string;
  customerName: string;
  email: string;
  product: string;
  quantity: number;
  price: number;
  statusId: string;
  preorderWhen: string;
  startsAt: string;
  endsAt: string;
  notes: string;
}
