import { Link, useLocation } from "wouter";
import { 
  Compass, 
  UsersRound,
  PlusSquare,
  UserCircle,
  Globe
} from "lucide-react";

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { icon: Globe, label: "Companion", href: "/companion" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
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
              <a className="flex flex-col items-center gap-1">
                <Icon 
                  className={`w-6 h-6 ${
                    isActive ? "text-white" : "text-white/60"
                  }`} 
                />
                <span className={`text-xs uppercase tracking-wider ${
                  isActive ? "text-white" : "text-white/60"
                }`}>
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