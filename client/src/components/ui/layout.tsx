import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { Bot, Menu } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

            {/* Desktop Navigation Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.href}
                      className="cursor-pointer"
                      onClick={() => setLocation(item.href)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
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