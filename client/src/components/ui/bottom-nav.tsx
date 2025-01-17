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

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { icon: UsersRound, label: "Connect", href: "/connect" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Inbox, label: "Inbox", href: "/messages" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" }
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-14 left-0 right-0 z-[100] bg-background/95 backdrop-blur-lg border-t shadow-lg">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a 
                role="button"
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-lg transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">
                  {label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}