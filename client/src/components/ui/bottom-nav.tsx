import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Globe,
  Settings,
  User,
  MessageSquare,
  Inbox,
  Bot,
  Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InviteTrigger } from "./invite-dialog";

// Mock unread count for demo - this would come from your actual message state
const unreadCount = 3;

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { icon: Bot, label: "Guide", href: "/companion" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { 
    icon: Inbox, 
    label: "Inbox", 
    href: "/messages",
    badge: unreadCount
  },
  { icon: User, label: "Profile", href: "/profile" }
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-border/10 shadow-lg pb-6">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
          {navItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <a 
                  role="button"
                  className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-16 rounded-lg transition-all duration-300 ease-out touch-target interactive-hover ${
                    isActive 
                      ? "text-primary scale-110" 
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-medium transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-60'
                  }`}>
                    {label}
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
          {/* Invite Dialog for Mobile */}
          <div className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-16">
            <InviteTrigger />
          </div>
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] w-16 glass border-r border-border/10 shadow-lg flex-col items-center py-8">
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a 
                role="button"
                className={`relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-all duration-300 ease-out mb-4 group interactive-hover ${
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-16 glass text-foreground px-2 py-1 rounded whitespace-nowrap border border-border/10 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  {label}
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
        {/* Desktop Invite Button */}
        <div className="mt-auto">
          <InviteTrigger />
        </div>
      </nav>
    </>
  );
}