"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Preorder, PreorderListResponse } from "@/types/preorder";
import { StatusBadge } from "./StatusBadge";
import { StatusToggle } from "./StatusToggle";

type FilterStatus = "all" | "active" | "inactive";
type SortField =
  | "orderNumber"
  | "customerName"
  | "product"
  | "price"
  | "quantity"
  | "createdAt";
type SortOrder = "asc" | "desc";

function SortIcon({
  field,
  activeField,
  sortOrder,
}: {
  field: SortField;
  activeField: SortField;
  sortOrder: SortOrder;
}) {
  if (activeField !== field) {
    return <ChevronsUpDown size={14} className="text-gray-400" />;
  }

  return sortOrder === "asc" ? (
    <ChevronUp size={14} className="text-blue-600" />
  ) : (
    <ChevronDown size={14} className="text-blue-600" />
  );
}

export function PreorderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PreorderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const status = (searchParams.get("status") as FilterStatus) || "all";
  const sortField = (searchParams.get("sortField") as SortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    if (!updates.page) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params = new URLSearchParams({
        status,
        sortField,
        sortOrder,
        page: String(page),
        perPage: "10",
      });
      const res = await fetch(`/api/preorders?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [status, sortField, sortOrder, page]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      updateParams({
        sortField: field,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      updateParams({ sortField: field, sortOrder: "asc" });
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (!data) return;
    if (selected.size === data.data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.data.map((p) => p.id)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this preorder?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/preorders/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Preorder deleted successfully");
        fetchData();
      } else {
        showToast("Failed to delete preorder", "error");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleStatusToggle(id: string, newStatus: "active" | "inactive") {
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((p) =>
              p.id === id ? { ...p, status: newStatus } : p,
            ),
          }
        : prev,
    );
    showToast(`Status updated to ${newStatus}`);
  }

  const preorders = data?.data || [];
  const allSelected =
    preorders.length > 0 && selected.size === preorders.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Preorders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track all customer preorders
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push("/preorders/create")}
          >
            <Plus size={16} />
            Create Preorder
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Filters + Sort Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
            {(["all", "active", "inactive"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  status === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                {data && s === "all" && (
                  <span
                    className={`ml-1.5 text-xs ${status === "all" ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {data.total}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={`${sortField}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(":");
                updateParams({ sortField: field, sortOrder: order });
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="customerName:asc">Customer Name (A-Z)</option>
              <option value="customerName:desc">Customer Name (Z-A)</option>
              <option value="orderNumber:asc">Order Number (A-Z)</option>
              <option value="orderNumber:desc">Order Number (Z-A)</option>
              <option value="price:asc">Price (Low to High)</option>
              <option value="price:desc">Price (High to Low)</option>
              <option value="quantity:asc">Quantity (Low to High)</option>
              <option value="quantity:desc">Quantity (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {selected.size > 0 && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center gap-2">
              <span className="text-sm text-blue-700 font-medium">
                {selected.size} row{selected.size > 1 ? "s" : ""} selected
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("orderNumber")}
                  >
                    <div className="flex items-center gap-1.5">
                      Order #{" "}
                      <SortIcon
                        field="orderNumber"
                        activeField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center gap-1.5">
                      Customer{" "}
                      <SortIcon
                        field="customerName"
                        activeField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("product")}
                  >
                    <div className="flex items-center gap-1.5">
                      Product{" "}
                      <SortIcon
                        field="product"
                        activeField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Qty{" "}
                      <SortIcon
                        field="quantity"
                        activeField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Price{" "}
                      <SortIcon
                        field="price"
                        activeField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 bg-gray-100 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : preorders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <PackageX size={40} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No preorders found
                        </p>
                        <p className="text-gray-400 text-xs">
                          {status !== "all"
                            ? `No ${status} preorders match your filter.`
                            : "Create your first preorder to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  preorders.map((preorder: Preorder) => (
                    <tr
                      key={preorder.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selected.has(preorder.id) ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(preorder.id)}
                          onChange={() => toggleSelect(preorder.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900">
                        {preorder.orderNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-800">
                          {preorder.customerName}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {preorder.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[180px] truncate">
                        {preorder.product}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-700">
                        {preorder.quantity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-800">
                        BDT {preorder.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={preorder.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusToggle
                          id={preorder.id}
                          status={preorder.status}
                          onToggle={handleStatusToggle}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/preorders/${preorder.id}/edit`)
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(preorder.id)}
                            disabled={deletingId === preorder.id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(page - 1) * 10 + 1}-{Math.min(page * 10, data.total)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">{data.total}</span>{" "}
                preorders
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                        p === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= data.totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
