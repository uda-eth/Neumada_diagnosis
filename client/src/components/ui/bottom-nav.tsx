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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a 
                role="button"
                className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-lg transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">
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