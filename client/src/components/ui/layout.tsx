import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { Bot } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with branding */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a className="flex items-center space-x-2" href="/">
              <Logo className="h-8 w-auto" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/companion")}
              className="hidden md:inline-flex items-center text-foreground"
            >
              <Bot className="h-5 w-5 mr-2" />
              City Guide
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with bottom padding for mobile nav */}
      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>

      {/* Bottom navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}