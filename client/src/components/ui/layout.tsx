import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { Bot, Menu } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { PremiumDialog } from "./premium-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navItems } from "./bottom-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
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
                className="hidden md:inline-flex items-center text-foreground interactive-hover"
              >
                <Bot className="w-6 h-6 mr-2" />
                Guide
              </Button>

              <LanguageToggle />

              {/* Premium Button - Desktop Only */}
              <div className="hidden md:block">
                <PremiumDialog />
              </div>

              {/* Desktop Navigation Menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="interactive-hover">
                      <Menu className="w-6 h-6" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {navItems.map((item) => (
                      <DropdownMenuItem 
                        key={item.href}
                        className="cursor-pointer interactive-hover"
                        onClick={() => setLocation(item.href)}
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}