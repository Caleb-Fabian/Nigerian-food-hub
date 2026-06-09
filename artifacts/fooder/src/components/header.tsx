import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, LogOut, LayoutDashboard, ChevronDown, Search, X } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: cart } = useGetCart({ query: { enabled: !!user } });
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setLocation(`/menu?q=${encodeURIComponent(q)}`);
    } else {
      setLocation("/menu");
    }
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Expanding search overlay */}
      {searchOpen && (
        <div className="absolute inset-0 z-10 flex items-center bg-background px-4 gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Search for jollof rice, suya, puff puff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base [color-scheme:light]"
              data-testid="input-header-search"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
              data-testid="button-header-search-submit"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            data-testid="button-header-search-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-serif text-primary">Fooder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/menu" className={`transition-colors hover:text-primary ${location.startsWith('/menu') ? 'text-primary' : 'text-muted-foreground'}`}>
              Menu
            </Link>
            {user && (
              <Link href="/orders" className={`transition-colors hover:text-primary ${location.startsWith('/orders') ? 'text-primary' : 'text-muted-foreground'}`}>
                My Orders
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className={`transition-colors hover:text-primary ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            title="Search"
            data-testid="button-open-search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hidden sm:flex">
                  <span className="truncate max-w-[100px]">{user.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/orders">
                  <DropdownMenuItem className="cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger could go here */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
