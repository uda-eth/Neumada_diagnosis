import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Bot,
  Menu,
  Settings,
  User,
  Crown,
  Share2,
  Inbox,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InviteTrigger } from "./invite-dialog";
import { useTranslation } from "@/lib/translations";
import { PremiumDialog } from "./premium-dialog";

// Main navigation items - only the 4 core features
export const mainNavItems = [
  { icon: Compass, label: 'discover', href: "/" },
  { icon: UsersRound, label: 'connect', href: "/connect" },
  { icon: PlusSquare, label: 'create', href: "/create" },
  { icon: Bot, label: 'guide', href: "/companion" }
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
                  <span className="text-[10px] font-medium text-center">
                    {label === 'guide' ? 'AI Guide' : t(label)}
                  </span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] w-16 glass border-r border-border/10 shadow-lg flex-col items-center py-8">
          {mainNavItems.map(({ icon: Icon, label, href }) => {
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
                    {label === 'guide' ? 'AI Guide' : t(label)}
                  </span>
                </a>
              </Link>
            );
          })}
      </nav>
    </>
  );
}