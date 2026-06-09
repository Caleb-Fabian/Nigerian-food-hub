import { useListAllOrders, useUpdateOrderStatus, getListAllOrdersQueryKey, OrderStatusUpdateStatus } from "@workspace/api-client-react";
import { format } from "date-fns";
import { formatNaira } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, ArrowLeft } from "lucide-react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useListAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (orderId: number, newStatus: OrderStatusUpdateStatus) => {
    updateOrderStatus.mutate(
      { id: orderId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() });
          toast({
            title: "Status Updated",
            description: `Order #${orderId} status changed to ${newStatus}`,
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to update status",
            description: err.message || "An error occurred",
          });
        }
      }
    );
  };

  const statusOptions = Object.values(OrderStatusUpdateStatus);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Manage Orders</h1>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">Manage Orders</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Update Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">#{order.id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "MMM d, h:mm a")}</TableCell>
                    <TableCell>
                      {order.userName}
                      <span className="block text-xs text-muted-foreground">{order.items.length} items</span>
                    </TableCell>
                    <TableCell className="font-bold">{formatNaira(order.total)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status as any} />
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={order.status} 
                        onValueChange={(val) => handleStatusChange(order.id, val as OrderStatusUpdateStatus)}
                        disabled={updateOrderStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
