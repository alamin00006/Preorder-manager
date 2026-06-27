"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Preorder, PreorderFormData } from "@/modules/preorders/preorder.types";

interface PreorderFormProps {
  initialData?: Preorder;
  mode: "create" | "edit";
}

const emptyForm: PreorderFormData = {
  name: "",
  products: 1,
  statusId: "active-id",
  preorderWhen: "regardless-of-stock",
  startsAt: "",
  endsAt: "",
  notes: "",
};

function toDateTimeInputValue(value?: Date | string | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 16);
}

export function PreorderForm({ initialData, mode }: PreorderFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PreorderFormData>(
    initialData
      ? {
          name: initialData.name,
          products: initialData.products,
          statusId: initialData.statusId,
          preorderWhen: initialData.preorderWhen || "regardless-of-stock",
          startsAt: toDateTimeInputValue(initialData.startsAt),
          endsAt: toDateTimeInputValue(initialData.endsAt),
          notes: initialData.notes || "",
        }
      : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;

    if (name === "products") {
      const numValue = parseFloat(value);
      setForm((prev) => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const url =
        mode === "edit"
          ? `/api/preorders/${initialData!.id}`
          : "/api/preorders";
      const method = mode === "edit" ? "PUT" : "POST";

      const payload = {
        name: form.name,
        products: form.products,
        statusId: form.statusId,
        preorderWhen: form.preorderWhen,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        notes: form.notes,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/preorders");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => router.push("/preorders")}
            variant="ghost"
            className="h-auto px-2 py-1"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => router.push("/preorders")}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Preorder details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            These values appear in the preorders list.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <Label className="mb-1.5">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="A label to recognize this preorder by."
              className="h-12"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              A label to recognize this preorder by.
            </p>
          </div>

          {/* Products Field */}
          <div>
            <Label className="mb-1.5">Products</Label>
            <div className="flex items-center gap-3">
              <Input
                name="products"
                type="number"
                min="1"
                value={form.products}
                onChange={handleChange}
                className="w-24 h-12"
              />
              <span className="text-sm text-gray-600">product(s)</span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Number of products covered by this preorder.
            </p>
          </div>

          {/* Preorder When Field */}
          <div>
            <Label className="mb-1.5">Preorder when</Label>
            <select
              name="preorderWhen"
              value={form.preorderWhen}
              onChange={handleChange}
              className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="regardless-of-stock">regardless-of-stock</option>
              <option value="out-of-stock">out-of-stock</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              When customers are allowed to preorder.
            </p>
          </div>

          {/* Starts At Field */}
          <div>
            <Label className="mb-1.5">Starts at</Label>
            <Input
              name="startsAt"
              type="datetime-local"
              value={form.startsAt}
              onChange={handleChange}
              className="h-12"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              When the preorder window opens.
            </p>
          </div>

          {/* Ends At Field */}
          <div>
            <Label className="mb-1.5">Ends at</Label>
            <Input
              name="endsAt"
              type="datetime-local"
              value={form.endsAt}
              onChange={handleChange}
              className="h-12"
              placeholder="mm/dd/yyyy, --:-- --"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Leave empty for no end date.
            </p>
          </div>

          {/* Status Field */}
          <div>
            <Label className="mb-1.5">Status</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    statusId:
                      prev.statusId === "active-id"
                        ? "inactive-id"
                        : "active-id",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.statusId === "active-id" ? "bg-gray-800" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.statusId === "active-id"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {form.statusId === "active-id" ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Active preorders are visible to customers.
            </p>
          </div>
        </Card>

        {/* Action Buttons at bottom */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            onClick={() => router.push("/preorders")}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
