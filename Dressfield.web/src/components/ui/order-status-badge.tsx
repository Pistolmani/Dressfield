import { OrderStatus, OrderStatusLabels, OrderStatusColors } from "@/types/order";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OrderStatusColors[status]}`}
    >
      {OrderStatusLabels[status]}
    </span>
  );
}
