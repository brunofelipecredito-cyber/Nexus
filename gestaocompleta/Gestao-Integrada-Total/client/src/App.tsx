import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { ThemeConfigProvider } from "@/hooks/use-theme-config";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Pages & Components
import Login from "@/pages/login";
import CRM from "@/components/CRM";
import MindMap from "@/components/MindMap";
import SalesFunnel from "@/components/SalesFunnel";
import PresentationReport from "@/components/PresentationReport";
import ConfigPanel from "@/components/ConfigPanel";

// Icons
import { LayoutDashboard, Network, Filter, FileText, Settings, LogOut, CarFront } from "lucide-react";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: "crm", label: "CRM", fullLabel: "CRM Veículos", icon: <LayoutDashboard className="w-5 h-5" />, path: "/" },
    { id: "mindmap", label: "Arquitetura", fullLabel: "Arquitetura", icon: <Network className="w-5 h-5" />, path: "/mindmap" },
    { id: "funnel", label: "Funil", fullLabel: "Funil Visual", icon: <Filter className="w-5 h-5" />, path: "/funnel" },
    { id: "report", label: "Relatórios", fullLabel: "Relatórios", icon: <FileText className="w-5 h-5" />, path: "/report" },
    { id: "config", label: "Config", fullLabel: "Configurações", icon: <Settings className="w-5 h-5" />, path: "/config" },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden font-sans">
      {/* Sidebar Navigation — Desktop only */}
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-md hidden md:flex flex-col flex-shrink-0 relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <CarFront className="w-6 h-6" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">NEXUS</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.fullLabel}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 md:hidden flex-shrink-0 z-30">
          <div className="flex items-center gap-2 text-primary">
            <CarFront className="w-5 h-5" />
            <span className="font-display font-bold text-lg text-foreground">NEXUS</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Dynamic Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 bg-background/50 pb-24 md:pb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />
          {children}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.path)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium leading-none mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout><CRM /></MainLayout>
      </Route>
      <Route path="/mindmap">
        <MainLayout><MindMap /></MainLayout>
      </Route>
      <Route path="/funnel">
        <MainLayout><SalesFunnel /></MainLayout>
      </Route>
      <Route path="/report">
        <MainLayout><PresentationReport /></MainLayout>
      </Route>
      <Route path="/config">
        <MainLayout><ConfigPanel /></MainLayout>
      </Route>
      <Route>
        <MainLayout>
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold">Página não encontrada</h2>
            <p className="text-muted-foreground mt-2">A sessão que você procura não existe ou foi movida.</p>
          </div>
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeConfigProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        {!isAuthenticated ? (
          <Login onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <Router />
        )}
      </QueryClientProvider>
    </ThemeConfigProvider>
  );
}

export default App;
