import React from "react";
import { useLocation } from "wouter";
import { BackButton } from '@/components/ui/back-button';
import { 
  MapPin, 
  UserCircle, 
  PlusCircle, 
  Globe, 
  Inbox as InboxIcon 
} from "lucide-react";

const iconMap = {
  Discover: MapPin,
  Connect: UserCircle,
  Create: PlusCircle,
  Concierge: Globe,
  Inbox: InboxIcon,
};

interface GradientHeaderProps {
  title: keyof typeof iconMap;
  children?: React.ReactNode;
  showBackButton?: boolean;
  backButtonFallbackPath?: string;
  forceUsePathFallback?: boolean;
  className?: string;
}

export function GradientHeader({ 
  title, 
  children,
  showBackButton = true,
  backButtonFallbackPath = "/discover",
  forceUsePathFallback = false,
  className = ""
}: GradientHeaderProps) {
  const Icon = iconMap[title];
  const [location] = useLocation();
  
  // Auto-detect if we're on profile page to force fallback
  const isProfilePage = location.startsWith('/profile/');
  const shouldForcePathFallback = forceUsePathFallback || isProfilePage;

  return (
    <header className={`sticky top-0 z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b border-border ${className}`}>
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 overflow-visible w-full">
          {showBackButton && (
            <BackButton 
              fallbackPath={backButtonFallbackPath} 
              forceUsePathFallback={shouldForcePathFallback} 
            />
          )}
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
            <h1 className="text-sm font-medium uppercase tracking-[.5em] text-white">
              {title}
            </h1>
          </div>
          {children && (
            <div className="ml-auto flex items-center flex-shrink-0 gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}