import { Header } from "./header";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-serif text-lg font-bold text-foreground mb-2">Fooder</p>
          <p>&copy; {new Date().getFullYear()} Fooder. Authentic Nigerian Cuisine.</p>
        </div>
      </footer>
    </div>
  );
}
