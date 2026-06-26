import { notFound } from "next/navigation";
import { PreorderForm } from "@/components/PreorderForm";
import { preorderService } from "@/modules/preorders/preorder.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPreorderPage({ params }: Props) {
  const { id } = await params;
  let preorder;
  try {
    preorder = await preorderService.getById(id);
    console.log(preorder);
  } catch (error) {
    if (error) notFound();
    throw error;
  }

  const serialized = {
    ...preorder,
    createdAt: preorder.createdAt.toISOString(),
    updatedAt: preorder.updatedAt.toISOString(),
    status: preorder.status as "active" | "inactive",
  };

  return <PreorderForm mode="edit" initialData={serialized} />;
}
