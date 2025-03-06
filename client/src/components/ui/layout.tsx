import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { Menu, Bot, Globe, Inbox, Crown, Settings, UserCircle, HelpCircle } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [, setLocation] = useLocation();

  const menuItems = [
    { href: "/premium", label: "Premium Upgrade", icon: Crown, isPremium: true },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/translator", label: "Translator", icon: Globe },
    { href: "/companion", label: "Concierge", icon: Bot },
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help", icon: HelpCircle }
  ];

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
              {/* Hamburger Menu - only show on desktop */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="interactive-hover">
                      <Menu className="w-6 h-6" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {menuItems.map((item) => (
                      <DropdownMenuItem 
                        key={item.href}
                        className={`cursor-pointer interactive-hover ${item.isPremium ? 'text-purple-500 font-medium' : ''}`}
                        onClick={() => setLocation(item.href)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        <span>{item.label}</span>
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