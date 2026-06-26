import { notFound } from "next/navigation";
import { PreorderForm } from "@/components/preorder/PreorderForm";
import { preorderService } from "@/modules/preorders/preorder.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPreorderPage({ params }: Props) {
  const { id } = await params;
  let preorder;
  try {
    preorder = await preorderService.getById(id);
  } catch (error) {
    notFound();
  }

  const serialized = {
    id: preorder.id,
    orderNumber: preorder.orderNumber,
    customerName: preorder.customerName,
    email: preorder.email,
    product: preorder.product,
    quantity: preorder.quantity,
    price: preorder.price,
    statusId:
      (preorder as any).statusId || (preorder as any).status === "inactive"
        ? "inactive-id"
        : "active-id",
    preorderWhen: (preorder as any).preorderWhen || "regardless-of-stock",
    startsAt: (preorder as any).startsAt?.toISOString() || "",
    endsAt: (preorder as any).endsAt?.toISOString() || null,
    notes: preorder.notes,
    createdAt: preorder.createdAt.toISOString(),
    updatedAt: preorder.updatedAt.toISOString(),
  };

  return <PreorderForm mode="edit" initialData={serialized} />;
}
