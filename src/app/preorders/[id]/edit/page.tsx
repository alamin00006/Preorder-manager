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
    ...preorder,
    createdAt: preorder.createdAt.toISOString(),
    updatedAt: preorder.updatedAt.toISOString(),
    status: preorder.status as "active" | "inactive",
  };

  return <PreorderForm mode="edit" initialData={serialized} />;
}
