export type PreorderStatus = "active" | "inactive";

export type SortField =
  | "orderNumber"
  | "customerName"
  | "product"
  | "price"
  | "quantity"
  | "createdAt";
export type SortOrder = "asc" | "desc";

export interface Preorder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  product: string;
  quantity: number;
  price: number;
  status: PreorderStatus;
  notes: string | null;
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
  status: PreorderStatus;
  notes: string;
}
