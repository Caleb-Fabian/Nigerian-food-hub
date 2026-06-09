import { useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, "Delivery address must be at least 5 characters"),
  note: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Cart() {
  const { data: cartItems, isLoading } = useGetCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: "",
      note: "",
    },
  });

  const cartTotal = cartItems?.reduce((total, item) => total + item.subtotal, 0) || 0;

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    updateCartItem.mutate(
      { id, data: { quantity: newQuantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
      }
    );
  };

  const handleRemoveItem = (id: number) => {
    removeCartItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ description: "Item removed from cart" });
        },
      }
    );
  };

  const handleClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ description: "Cart cleared" });
      },
    });
  };

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder.mutate(
      { data },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Order Placed Successfully!",
            description: `Order #${order.id} has been created.`,
          });
          setLocation(`/orders/${order.id}`);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to place order",
            description: error.message || "Something went wrong",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Your Cart</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-24 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-muted/50 p-6 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added any delicious Nigerian food to your cart yet.
        </p>
        <Link href="/menu">
          <Button size="lg" className="px-8">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Your Cart</h1>
        <Button variant="outline" size="sm" onClick={handleClearCart} disabled={clearCart.isPending}>
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-32 bg-muted shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif">
                      Fooder
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold">{item.name}</h3>
                      <p className="text-muted-foreground">{formatNaira(item.price)} each</p>
                    </div>
                    <p className="font-bold text-lg">{formatNaira(item.subtotal)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-md bg-background">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || updateCartItem.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={updateCartItem.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeCartItem.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Checkout Form & Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-primary/20 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4 text-muted-foreground">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatNaira(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-muted-foreground">
                <span>Delivery Fee</span>
                <span>Calculated later</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-border">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formatNaira(cartTotal)}</span>
              </div>

              <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Enter your full delivery address"
                    className="resize-none"
                    {...form.register("deliveryAddress")}
                  />
                  {form.formState.errors.deliveryAddress && (
                    <p className="text-sm text-destructive">{form.formState.errors.deliveryAddress.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Order Notes (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="Any special instructions?"
                    {...form.register("note")}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full text-lg h-12" 
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
