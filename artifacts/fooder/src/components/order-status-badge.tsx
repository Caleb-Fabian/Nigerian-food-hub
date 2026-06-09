import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@workspace/api-client-react";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let colorClass = "";
  let label = status;

  switch (status) {
    case OrderStatus.pending:
      colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200";
      break;
    case OrderStatus.confirmed:
      colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200";
      break;
    case OrderStatus.preparing:
      colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 border-orange-200";
      break;
    case OrderStatus.ready:
      colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 border-purple-200";
      break;
    case OrderStatus.delivered:
      colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200";
      break;
    case OrderStatus.cancelled:
      colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-200";
  }

  return (
    <Badge variant="outline" className={`capitalize ${colorClass}`}>
      {label}
    </Badge>
  );
}
