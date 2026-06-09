import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
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
  const [location] = useLocation();
  const { data: cart } = useGetCart({ query: { enabled: !!user } });
  const { theme, setTheme } = useTheme();

  const totalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
