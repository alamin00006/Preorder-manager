import { notFound } from "next/navigation";
import { PreorderForm } from "@/components/preorder/PreorderForm";
import { preorderService } from "@/modules/preorders/preorder.service";

interface Props {
  params: Promise<{ id: string }>;
}

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return null;

  return value instanceof Date ? value.toISOString() : value;
};

const EditPreorderPage = async ({ params }: Props) => {
  const { id } = await params;
  let preorder;
  try {
    preorder = await preorderService.getById(id);
  } catch {
    notFound();
  }

  const serialized = {
    id: preorder.id,
    orderNumber: preorder.orderNumber,
    name: preorder.name,
    products: preorder.products,
    statusId: preorder.statusId,
    status: preorder.status,
    preorderWhen: preorder.preorderWhen || "regardless-of-stock",
    startsAt: toIsoString(preorder.startsAt) || "",
    endsAt: toIsoString(preorder.endsAt),
    notes: preorder.notes,
    createdAt: toIsoString(preorder.createdAt) || "",
    updatedAt: toIsoString(preorder.updatedAt) || "",
  };

  return <PreorderForm mode="edit" initialData={serialized} />;
};

export default EditPreorderPage;
