import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminOrders from "@/pages/admin-orders";
import AdminMenu from "@/pages/admin-menu";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (adminOnly && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation, adminOnly]);

  if (!user) return null;
  if (adminOnly && user.role !== "admin") return null;

  return <Component {...rest} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/menu" component={Menu} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* User Protected Routes */}
        <Route path="/cart">
          {() => <ProtectedRoute component={Cart} />}
        </Route>
        <Route path="/orders">
          {() => <ProtectedRoute component={Orders} />}
        </Route>
        <Route path="/orders/:id">
          {() => <ProtectedRoute component={OrderDetail} />}
        </Route>
        
        {/* Admin Protected Routes */}
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} adminOnly />}
        </Route>
        <Route path="/admin/orders">
          {() => <ProtectedRoute component={AdminOrders} adminOnly />}
        </Route>
        <Route path="/admin/menu">
          {() => <ProtectedRoute component={AdminMenu} adminOnly />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fooder-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
