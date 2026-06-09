import { useGetOrder, getGetOrderQueryKey, OrderStatus } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { formatNaira } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, MapPin, StickyNote } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id ? parseInt(params.id) : 0;

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Order not found</h2>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Back to My Orders
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Status:</span>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="font-serif">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-b">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{formatNaira(item.price)} each</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatNaira(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-6 bg-muted/10">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">{formatNaira(order.total)}</span>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="font-serif text-lg">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Delivery Address</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.deliveryAddress || "No address provided"}
                  </p>
                </div>
              </div>
              
              {order.note && (
                <div className="flex gap-3">
                  <StickyNote className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Order Note</p>
                    <p className="text-sm text-muted-foreground italic">"{order.note}"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
