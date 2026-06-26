import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Preorder Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The preorder you're trying to edit doesn't exist or has been
            removed.
          </p>
        </div>
        <Link href="/preorders">
          <Button className="gap-2">
            <ArrowLeft size={16} />
            Back to Preorders
          </Button>
        </Link>
      </Card>
    </div>
  );
}
