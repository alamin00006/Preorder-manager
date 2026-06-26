import { PreorderList } from "@/components/preorder/PreorderList";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function PreordersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <PreorderList />
    </Suspense>
  );
}
