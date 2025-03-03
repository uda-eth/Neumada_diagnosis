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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-lg border-t shadow-lg pb-6">
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
                    : "text-foreground hover:text-primary"
                }`}
              >
                <Icon className="w-6 h-6 current-color" />
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
  );
}