import { Suspense } from "react";
import OrdersManager from "@/components/admin/orders-manager";

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersManager />
    </Suspense>
  );
}
