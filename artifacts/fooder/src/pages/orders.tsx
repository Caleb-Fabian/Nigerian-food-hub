import { useListMyOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = useListMyOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-muted/50 p-6 rounded-full mb-6">
          <Package className="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">No orders yet</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          You haven't placed any orders. Discover the best Nigerian food and place your first order!
        </p>
        <Link href="/menu">
          <Button size="lg" className="px-8">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              <div className="p-6 bg-muted/30 flex-1 border-b sm:border-b-0 sm:border-r">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg font-mono">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {order.items.slice(0, 3).map(item => (
                    <span key={item.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 sm:w-48 flex flex-col justify-center items-start sm:items-end bg-background">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-xl font-bold text-primary mb-4">{formatNaira(order.total)}</p>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" className="w-full sm:w-auto">View Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
