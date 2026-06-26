"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Preorder, PreorderFormData } from "@/types/preorder";

interface PreorderFormProps {
  initialData?: Preorder;
  mode: "create" | "edit";
}

const emptyForm: PreorderFormData = {
  orderNumber: "",
  customerName: "",
  email: "",
  product: "",
  quantity: 1,
  price: 0,
  status: "active",
  notes: "",
};

export function PreorderForm({ initialData, mode }: PreorderFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PreorderFormData>(
    initialData
      ? {
          orderNumber: initialData.orderNumber,
          customerName: initialData.customerName,
          email: initialData.email,
          product: initialData.product,
          quantity: initialData.quantity,
          price: initialData.price,
          status: initialData.status,
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

    if (name === "quantity" || name === "price") {
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
        customerName: form.customerName,
        email: form.email,
        product: form.product,
        quantity: form.quantity,
        price: form.price,
        status: form.status,
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.push("/preorders")}
            variant="ghost"
            className="h-auto px-2 py-1"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Preorders</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-800">
            {mode === "create" ? "Create Preorder" : "Edit Preorder"}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {mode === "create" ? "Create Preorder" : "Update Preorder"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "create"
              ? "Fill in the details below to create a new preorder."
              : "Update the preorder details and save your changes."}
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="mb-1.5">
                Order Number <span className="text-red-500">*</span>
              </Label>
              <Input
                name="orderNumber"
                value={
                  mode === "create"
                    ? "Auto-generated on save"
                    : form.orderNumber
                }
                readOnly
                disabled={mode === "create"}
              />
            </div>
            <div>
              <Label className="mb-1.5">Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label className="mb-1.5">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <Label className="mb-1.5">
              Product <span className="text-red-500">*</span>
            </Label>
            <Input
              name="product"
              value={form.product}
              onChange={handleChange}
              placeholder="Product name"
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-1.5">
                Price (BDT) <span className="text-red-500">*</span>
              </Label>
              <Input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="mb-1.5">Notes</Label>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes..."
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            onClick={() => router.push("/preorders")}
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
