"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Preorder, PreorderListResponse } from "@/types/preorder";
import { StatusBadge } from "./StatusBadge";
import { StatusToggle } from "./StatusToggle";

type FilterStatus = "all" | "active" | "inactive";
type SortField = "name" | "createdAt" | "startsAt" | "endsAt";
type SortOrder = "asc" | "desc";

export function PreorderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PreorderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
    updateParams({
      sortField: field,
      sortOrder: sortOrder === "asc" ? "desc" : "asc",
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev: Set<string>) => {
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
      setSelected(new Set(data.data.map((p: Preorder) => p.id)));
    }
  }

  function openDeleteModal(id: string) {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    setDeleteModalOpen(false);
    setDeletingId(itemToDelete);
    try {
      const res = await fetch(`/api/preorders/${itemToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Preorder deleted successfully");
        fetchData();
      } else {
        showToast("Failed to delete preorder", "error");
      }
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  }

  function handleDelete(id: string) {
    openDeleteModal(id);
  }

  function handleStatusToggle(id: string, newStatus: "active" | "inactive") {
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((p) =>
              p.id === id ? { ...p, status: { name: newStatus } } : p,
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Preorder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this preorder? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Preorders</h1>
          <Button
            type="button"
            onClick={() => router.push("/preorders/create")}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            Create Preorder
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Filters + Sort Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            {(["all", "active", "inactive"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  status === s
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <ArrowUpDown size={16} className="text-gray-500" />
              <span className="text-gray-700">Sort by</span>
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Sort by
                  </div>
                  {[
                    { field: "name" as SortField, label: "Name" },
                    { field: "createdAt" as SortField, label: "Created At" },
                    { field: "startsAt" as SortField, label: "Starts At" },
                    { field: "endsAt" as SortField, label: "Ends At" },
                  ].map((option) => (
                    <div
                      key={option.field}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        handleSort(option.field);
                        setShowSortDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {sortField === option.field && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp
                                  size={14}
                                  className="text-gray-600"
                                />
                              ) : (
                                <ChevronDown
                                  size={14}
                                  className="text-gray-600"
                                />
                              )}
                            </>
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border ${
                              sortField === option.field
                                ? "border-gray-800"
                                : "border-gray-300"
                            } flex items-center justify-center`}
                          >
                            {sortField === option.field && (
                              <div className="w-2 h-2 rounded-full bg-gray-800" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        updateParams({
                          sortOrder: sortOrder === "asc" ? "desc" : "asc",
                        });
                        setShowSortDropdown(false);
                      }}
                    >
                      <span className="text-sm text-gray-700">
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                      </span>
                      {sortOrder === "asc" ? (
                        <ChevronUp size={16} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Preorder when
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Starts at
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Ends at
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
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
                        {preorder.customerName}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {preorder.product}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {preorder.preorderWhen || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {preorder.startsAt
                          ? new Date(preorder.startsAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {preorder.endsAt
                          ? new Date(preorder.endsAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center">
                          <StatusToggle
                            id={preorder.id}
                            status={preorder.status?.name || "inactive"}
                            onToggle={handleStatusToggle}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
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
          {data && (
            <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(page - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(page * 10, data.total)}
                </span>{" "}
                from{" "}
                <span className="font-medium text-gray-700">{data.total}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
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
