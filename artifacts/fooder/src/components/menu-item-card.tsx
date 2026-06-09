import { MenuItem, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to add to cart",
          description: error.message || "An error occurred",
        });
      }
    }
  });

  const handleAddToCart = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    addToCart.mutate({ data: { menuItemId: item.id, quantity: 1 } });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-border hover:border-primary/50 group h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
            <span className="font-serif italic text-lg opacity-50">Fooder</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-lg px-4 py-1">Sold Out</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0 flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <CardTitle className="text-lg font-serif leading-tight">{item.name}</CardTitle>
          <span className="font-semibold text-primary">{formatNaira(item.price)}</span>
        </div>
        {item.categoryName && (
          <Badge variant="secondary" className="w-fit text-xs font-normal text-muted-foreground">{item.categoryName}</Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 py-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 mt-auto">
        <Button 
          className="w-full font-medium" 
          onClick={handleAddToCart}
          disabled={!item.available || addToCart.isPending}
        >
          {addToCart.isPending ? (
            <span className="flex items-center gap-2">Adding...</span>
          ) : (
            <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Add to Cart</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
