import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Inbox,
  Bot,
  Menu,
  Settings,
  User,
  Crown,
  Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InviteTrigger } from "./invite-dialog";
import { useTranslation } from "@/lib/translations";
import { PremiumDialog } from "./premium-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock unread count for demo
const unreadCount = 3;

// Main navigation items
export const mainNavItems = [
  { icon: Compass, label: 'discover', href: "/" },
  { icon: UsersRound, label: 'connect', href: "/connect" },
  { icon: PlusSquare, label: 'create', href: "/create" },
  { 
    icon: Inbox, 
    label: 'inbox', 
    href: "/messages",
    badge: unreadCount
  },
  { icon: Bot, label: 'guide', href: "/companion" }
];

// Secondary navigation items for the hamburger menu
export const secondaryNavItems = [
  { icon: User, label: 'profile', href: "/profile/luca-hudek/edit" },
  { icon: Settings, label: 'settings', href: "/settings" },
  { icon: Crown, label: 'premium', href: "/premium" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-border/10 shadow-lg pb-6">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-3">
          {/* Invite Button */}
          <InviteTrigger>
            <button className="relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover text-foreground/60 hover:text-foreground">
              <Share2 className="w-6 h-6 transition-transform" />
              <span className="text-[10px] font-medium">Invite</span>
            </button>
          </InviteTrigger>
          {/* Premium Button - Special Position */}
          <PremiumDialog>
            <button className="relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover text-purple-400">
              <Crown className="w-6 h-6 transition-transform" />
              <span className="text-[10px] font-medium">Premium</span>
            </button>
          </PremiumDialog>

          {mainNavItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <a 
                  role="button"
                  className={`relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover ${
                    isActive 
                      ? "text-white scale-105" 
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6 transition-transform" />
                  <span className="text-[10px] font-medium">
                    {label === 'guide' ? 'Guide' : t(label)}
                  </span>
                  {badge && badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in fade-in duration-300"
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover text-foreground/60 hover:text-foreground">
                <Menu className="w-6 h-6 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {secondaryNavItems.map(({ icon: Icon, label, href }) => (
                <DropdownMenuItem key={href}>
                  <Link href={href}>
                    <a className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {t(label)}
                    </a>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] w-16 glass border-r border-border/10 shadow-lg flex-col items-center py-8">
        {mainNavItems.map(({ icon: Icon, label, href, badge }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a 
                role="button"
                className={`relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-all duration-300 ease-out mb-4 group interactive-hover ${
                  isActive 
                    ? "text-white scale-105" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-6 h-6 transition-transform" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-16 glass text-foreground px-2 py-1 rounded whitespace-nowrap border border-border/10 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  {label === 'guide' ? 'AI City Guide' : t(label)}
                </span>
                {badge && badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in fade-in duration-300"
                  >
                    {badge > 99 ? '99+' : badge}
                  </Badge>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
    </>
  );
}