import { useState } from "react";
import { useListMenuItems, useListCategories } from "@workspace/api-client-react";
import { MenuItemCard } from "@/components/menu-item-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  const { data: menuItems, isLoading: isLoadingMenu } = useListMenuItems({ 
    category: activeCategory 
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="container mx-auto relative z-20 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white drop-shadow-lg">
            Taste the Soul of Lagos
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-md">
            Authentic Nigerian cuisine, cooked with passion and delivered to your doorstep. 
            Experience the rich flavors of home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Our Menu</h2>
            <Link href="/menu">
              <Button variant="outline">View Full Menu</Button>
            </Link>
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
            <Button 
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="rounded-full whitespace-nowrap"
            >
              All Items
            </Button>
            
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))
            ) : (
              categories?.map(category => (
                <Button 
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="rounded-full whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))
            )}
          </div>

          {/* Menu Grid */}
          {isLoadingMenu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : menuItems && menuItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menuItems.slice(0, 8).map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-xl">No menu items found.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">Made with Love & Heritage</h2>
            <p className="text-lg text-muted-foreground mb-6">
              At Fooder, we believe that food is more than just sustenance—it's a celebration of culture, family, and history. Every dish we serve is prepared using traditional recipes passed down through generations.
            </p>
            <p className="text-lg text-muted-foreground">
              From our smoky party Jollof to our rich, savory Egusi, we source only the finest local ingredients to ensure every bite transports you straight to the heart of Nigeria.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=2070&auto=format&fit=crop" alt="Spices" className="rounded-2xl object-cover h-48 w-full shadow-md" />
                <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop" alt="Cooking" className="rounded-2xl object-cover h-64 w-full shadow-md" />
             </div>
             <div className="space-y-4 pt-8">
                <img src="https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1974&auto=format&fit=crop" alt="Serving" className="rounded-2xl object-cover h-64 w-full shadow-md" />
                <img src="https://images.unsplash.com/photo-1626804475297-41607ea0af49?q=80&w=2070&auto=format&fit=crop" alt="Food details" className="rounded-2xl object-cover h-48 w-full shadow-md" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
