import { useState } from "react";
import { useListMenuItems, useListCategories } from "@workspace/api-client-react";
import { MenuItemCard } from "@/components/menu-item-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  // Use debounced search internally in a real app, but here we just pass it
  const { data: menuItems, isLoading: isLoadingMenu } = useListMenuItems({ 
    category: activeCategory,
    search: searchQuery || undefined
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Explore our rich selection of authentic Nigerian dishes.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Categories */}
          <div className="flex overflow-x-auto pb-2 gap-2 w-full md:w-auto scrollbar-hide">
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

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              className="pl-9 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {isLoadingMenu ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
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
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-muted/30 rounded-2xl border border-dashed">
          <p className="text-xl text-muted-foreground font-serif">No dishes found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery("");
              setActiveCategory(null);
            }}
            className="mt-2 text-primary"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
