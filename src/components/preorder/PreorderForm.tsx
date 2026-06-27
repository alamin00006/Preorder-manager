"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Preorder, PreorderFormData } from "@/modules/preorders/preorder.types";
import { toDateTimeInputValue } from "@/lib/utils";

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

// Renders the shared create/edit preorder form and keeps form state in sync with inputs.
export const PreorderForm = ({ initialData, mode }: PreorderFormProps) => {
  const router = useRouter();
  const startsAtRef = useRef<HTMLInputElement>(null);
  const endsAtRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PreorderFormData>(
    initialData
      ? {
          name: initialData.name,
          products: initialData.products,
          statusId:
            initialData.status?.name === "inactive"
              ? "inactive-id"
              : "active-id",
          preorderWhen: initialData.preorderWhen || "regardless-of-stock",
          startsAt: toDateTimeInputValue(initialData.startsAt),
          endsAt: toDateTimeInputValue(initialData.endsAt),
          notes: initialData.notes || "",
        }
      : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stops obviously invalid form values before they reach the API validation layer.
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name is required";
    }

    if (!Number.isInteger(Number(form.products)) || Number(form.products) < 1) {
      return "Products must be a positive number";
    }

    return "";
  };

  // Updates form state and converts numeric inputs before storing them.
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "products") {
      const numValue = parseFloat(value);
      setForm((prev) => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submits the normalized payload to either the create or update.
  const handleSubmit = async () => {
    setError("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      toast.error(validationMessage);
      return;
    }

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

      await axios({
        url,
        method,
        data: payload,
      });

      toast.success(
        mode === "edit"
          ? "Preorder updated successfully"
          : "Preorder created successfully",
      );
      router.push("/preorders");
      router.refresh();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong"
        : "Network error. Please try again.";
      setError(message);
      toast.error(message);
      console.error("Preorder submit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Opens the native date-time picker when users click anywhere on the input area.
  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;

    // showPicker opens the native date-time picker from clicks on the wider input area.
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[912px] px-6 py-6">
        <div className="mb-8 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => router.push("/preorders")}
            variant="outline"
            className="h-10 gap-2 rounded-lg border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => router.push("/preorders")}
              variant="outline"
              className="h-10 rounded-lg border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="h-10 rounded-lg bg-[#1f1f1f] px-6 text-sm font-semibold text-white hover:bg-black"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h1 className="text-base font-bold text-gray-950">
              Preorder details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              These values appear in the preorders list.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="px-6">
            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Name <span className="text-red-500">*</span>
                </Label>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  A label to recognize this preorder by.
                </p>
              </div>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Multi variant 3"
                required
                className="h-10 max-w-[420px] rounded-lg border-gray-300 bg-white px-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Products
                </Label>
                <p className="mt-1 max-w-52 text-sm leading-5 text-slate-500">
                  Number of products covered by this preorder.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  name="products"
                  type="number"
                  min="1"
                  onChange={handleChange}
                  placeholder="No. of products"
                  className="h-10 w-36 rounded-lg border-gray-300 bg-white px-3 text-sm"
                />
                <span className="text-sm text-slate-600">product(s)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Preorder when
                </Label>
                <p className="mt-1 max-w-52 text-sm leading-5 text-slate-500">
                  When customers are allowed to preorder.
                </p>
              </div>
              <select
                name="preorderWhen"
                value={form.preorderWhen}
                onChange={handleChange}
                className="h-10 max-w-[420px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <option value="regardless-of-stock">regardless-of-stock</option>
                <option value="out-of-stock">out-of-stock</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Starts at
                </Label>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  When the preorder window opens.
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                className="max-w-[420px]"
                onClick={() => openDatePicker(startsAtRef)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDatePicker(startsAtRef);
                  }
                }}
              >
                <Input
                  ref={startsAtRef}
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="h-10 rounded-lg border-gray-300 bg-white px-3 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Ends at
                </Label>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Leave empty for no end date.
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                className="max-w-[420px]"
                onClick={() => openDatePicker(endsAtRef)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDatePicker(endsAtRef);
                  }
                }}
              >
                <Input
                  ref={endsAtRef}
                  name="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={handleChange}
                  className="h-10 rounded-lg border-gray-300 bg-white px-3 text-sm"
                  placeholder="mm/dd/yyyy, --:-- --"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-[220px_1fr] md:gap-6">
              <div>
                <Label className="text-sm font-bold text-gray-950">
                  Status
                </Label>
                <p className="mt-1 max-w-52 text-sm leading-5 text-slate-500">
                  Active preorders are visible to customers.
                </p>
              </div>
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
                  className={`relative inline-flex h-5 w-8 items-center rounded-md transition-colors ${
                    form.statusId === "active-id"
                      ? "bg-[#1f1f1f]"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-sm bg-white transition-transform ${
                      form.statusId === "active-id"
                        ? "translate-x-4"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {form.statusId === "active-id" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Button
              type="button"
              onClick={() => router.push("/preorders")}
              variant="outline"
              className="h-10 rounded-lg border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="h-10 rounded-lg bg-[#1f1f1f] px-6 text-sm font-semibold text-white hover:bg-black"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
