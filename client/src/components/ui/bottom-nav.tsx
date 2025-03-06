import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Bot,
  Menu,
  Crown,
  Inbox,
  Settings,
  UserCircle,
  Globe2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Main navigation items - only the 4 core features
export const mainNavItems = [
  { icon: Compass, label: 'discover', href: "/" },
  { icon: UsersRound, label: 'connect', href: "/connect" },
  { icon: PlusSquare, label: 'create', href: "/create" },
  { icon: Bot, label: 'concierge', href: "/companion" }
] as const;

// Menu items
export const menuItems = [
  { 
    icon: Crown, 
    label: 'Premium Benefits', 
    href: "/premium", 
    isPremium: true 
  },
  { 
    icon: Inbox, 
    label: 'Inbox', 
    href: "/inbox",
    badge: "3",
    preview: [
      { name: "Sarah K.", image: "/attached_assets/profile-1.jpg" },
      { name: "Miguel R.", image: "/attached_assets/profile-2.jpg" },
      { name: "Lisa T.", image: "/attached_assets/profile-3.jpg" }
    ]
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: "/settings" 
  },
  { 
    icon: UserCircle, 
    label: 'Edit Profile', 
    href: "/profile/edit" 
  },
  { 
    icon: Globe2, 
    label: 'Translator', 
    href: "/translator" 
  }
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-border/10 shadow-lg pb-6">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-3">
          {mainNavItems.map(({ icon: Icon, label, href }) => {
            const isActive = location === href;
            return (
              <Link 
                key={href} 
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover ${
                  isActive 
                    ? "text-white scale-105" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-6 h-6 transition-transform" />
                <span className="text-[10px] font-medium text-center">
                  {label === 'concierge' ? 'Concierge' : t(label)}
                </span>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover text-foreground/60 hover:text-foreground">
                <Menu className="w-6 h-6 transition-transform" />
                <span className="text-[10px] font-medium">Menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {menuItems.map(({ icon: Icon, label, href, isPremium, preview, badge }) => (
                <DropdownMenuItem key={href}>
                  <Link href={href} className="flex items-center gap-2 w-full">
                    <div className={`flex items-center gap-2 w-full ${isPremium ? 'text-purple-500 font-medium' : ''}`}>
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] w-16 glass border-r border-border/10 shadow-lg flex-col items-center py-8">
        {mainNavItems.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link 
              key={href} 
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-all duration-300 ease-out mb-4 group interactive-hover ${
                isActive 
                  ? "text-white scale-105" 
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Icon className="w-6 h-6 transition-transform" />
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-16 glass text-foreground px-2 py-1 rounded whitespace-nowrap border border-border/10 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                {label === 'concierge' ? 'Concierge' : t(label)}
              </span>
            </Link>
          );
        })}

        {/* Desktop Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-auto relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-all duration-300 ease-out interactive-hover text-foreground/60 hover:text-foreground">
              <Menu className="w-6 h-6 transition-transform" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="right" className="w-64">
            {menuItems.map(({ icon: Icon, label, href, isPremium, preview, badge }) => (
              <DropdownMenuItem key={href}>
                <Link href={href} className="flex items-center gap-2 w-full">
                  <div className={`flex items-center gap-2 w-full ${isPremium ? 'text-purple-500 font-medium' : ''}`}>
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  );
}