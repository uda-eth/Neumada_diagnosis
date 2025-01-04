import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  Globe,
  Settings
} from "lucide-react";

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { icon: UsersRound, label: "Connect", href: "/connect" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Globe, label: "Concierge", href: "/companion" },
  { icon: Settings, label: "Settings", href: "/settings" }
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <span 
                role="button"
                tabIndex={0}
                className={`flex flex-col items-center gap-1 w-full cursor-pointer focus:outline-none ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs uppercase tracking-wider">
                  {label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}