"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
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
import {
  Preorder,
  PreorderListResponse,
  SortField,
  SortOrder,
} from "@/modules/preorders/preorder.types";
import { StatusToggle } from "./StatusToggle";

type FilterStatus = "all" | "active" | "inactive";

export const PreorderList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PreorderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const status = (searchParams.get("status") as FilterStatus) || "all";
  const sortField = (searchParams.get("sortField") as SortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Updates URL query parameters so table state survives refresh, back navigation, and sharing.
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    if (!updates.page) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Loads the current table page using the active filter, sorting, and pagination state.
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
      const response = await axios.get<PreorderListResponse>(
        `/api/preorders?${params}`,
      );
      setData(response.data);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to load preorders"
        : "Failed to load preorders";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [status, sortField, sortOrder, page]);

  // Refetches data whenever a URL-driven table parameter changes.
  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  // Toggles a single row selection while preserving the rest of the selected set.
  const toggleSelect = (id: string) => {
    setSelected((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selects every visible row or clears the current page selection.
  const toggleSelectAll = () => {
    if (!data) return;
    if (selected.size === data.data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.data.map((p: Preorder) => p.id)));
    }
  };

  // Stores the pending delete target and opens the confirmation dialog.
  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  // Deletes the confirmed preorder and refreshes the table after a successful response.
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteModalOpen(false);
    setDeletingId(itemToDelete);
    try {
      await axios.delete(`/api/preorders/${itemToDelete}`);
      toast.success("Preorder deleted successfully");
      fetchData();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete preorder"
        : "Network error. Please try again.";
      toast.error(message);
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    openDeleteModal(id);
  };

  const handleStatusToggle = (id: string, newStatus: "active" | "inactive") => {
    // Applies the successful status toggle result to local table state without a full refetch.
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
    toast.success(`Status updated to ${newStatus}`);
  };

  const preorders = data?.data || [];
  const allSelected =
    preorders.length > 0 && selected.size === preorders.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="relative overflow-visible">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2.5">
            <div className="flex items-center gap-1">
              {(["all", "active", "inactive"] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateParams({ status: s })}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                    status === s
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                title="Sort"
              >
                <ArrowUpDown size={17} />
              </button>

              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="px-3 pb-2 text-sm font-medium text-gray-800">
                      Sort by
                    </div>
                    {[
                      { field: "name" as SortField, label: "Name" },
                      {
                        field: "createdAt" as SortField,
                        label: "Created At",
                      },
                      { field: "startsAt" as SortField, label: "Starts At" },
                      { field: "endsAt" as SortField, label: "Ends At" },
                    ].map((option) => (
                      <button
                        key={option.field}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          updateParams({ sortField: option.field });
                          setShowSortDropdown(false);
                        }}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            sortField === option.field
                              ? "border-gray-700"
                              : "border-gray-300"
                          }`}
                        >
                          {sortField === option.field && (
                            <span className="h-2 w-2 rounded-full bg-gray-800" />
                          )}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}

                    <div className="mt-2 border-t border-gray-200 pt-2">
                      {[
                        { order: "asc" as SortOrder, label: "Ascending" },
                        { order: "desc" as SortOrder, label: "Descending" },
                      ].map((option) => (
                        <button
                          key={option.order}
                          type="button"
                          className={`mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-gray-800 ${
                            sortOrder === option.order
                              ? "bg-gray-100"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            updateParams({ sortOrder: option.order });
                            setShowSortDropdown(false);
                          }}
                        >
                          <span className="w-3 text-base leading-none">
                            {option.order === "asc" ? "\u2191" : "\u2193"}
                          </span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

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
                    <td colSpan={8} className="py-16 text-center">
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
                        {preorder.name}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {preorder.products}
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
                            status={
                              preorder.status?.name === "active"
                                ? "active"
                                : "inactive"
                            }
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(preorder.id)}
                            disabled={deletingId === preorder.id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
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
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-1.5">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-200 text-gray-400 transition-colors hover:bg-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200/70 disabled:text-gray-300"
                >
                  <ChevronLeft size={16} strokeWidth={2.25} />
                </button>
                <p className="px-2 text-sm font-semibold text-gray-800">
                  Showing{" "}
                  <span>
                    {preorders.length > 0 ? (page - 1) * data.perPage + 1 : 0}
                  </span>{" "}
                  to <span>{Math.min(page * data.perPage, data.total)}</span>{" "}
                  from <span>{data.total}</span>
                </p>
                <button
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= data.totalPages}
                  aria-label="Next page"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-200 text-gray-400 transition-colors hover:bg-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200/70 disabled:text-gray-300"
                >
                  <ChevronRight size={16} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
