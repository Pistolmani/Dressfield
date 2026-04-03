import { Suspense } from "react";
import { AdminCustomOrderDetailPageClient } from "./page-client";

export default function AdminCustomOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="rounded-3xl border border-black/8 bg-white p-6 text-sm text-muted-foreground">
            იტვირთება...
          </div>
        </div>
      }
    >
      <AdminCustomOrderDetailPageClient />
    </Suspense>
  );
}

