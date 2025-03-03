import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Globe,
  Settings,
  User,
  MessageSquare,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock unread count for demo - this would come from your actual message state
const unreadCount = 3;

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { icon: UsersRound, label: "Connect", href: "/connect" },
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/80 dark:bg-white/10 backdrop-blur-lg border-t border-white/10 shadow-lg pb-6">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
          {navItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <a 
                  role="button"
                  className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-16 rounded-lg transition-colors ${
                    isActive 
                      ? "text-primary" 
                      : "text-white hover:text-primary"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">
                    {label}
                  </span>
                  {badge && badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] w-16 bg-black/80 dark:bg-white/10 backdrop-blur-lg border-r border-white/10 shadow-lg flex-col items-center py-8">
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a 
                role="button"
                className={`relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-colors mb-4 group ${
                  isActive 
                    ? "text-primary" 
                    : "text-white hover:text-primary"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-16 bg-black/90 px-2 py-1 rounded whitespace-nowrap">
                  {label}
                </span>
                {badge && badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
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