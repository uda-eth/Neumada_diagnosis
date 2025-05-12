import React from 'react';
import { BackButton } from '@/components/ui/back-button';
import { useLocation } from 'wouter';
import { Compass, UsersRound, PlusSquare, Bot, Inbox } from "lucide-react";

// Map of page titles to their corresponding icons
const HEADER_ICONS = {
  "Discover": Compass,
  "Connect": UsersRound,
  "Create": PlusSquare,
  "Concierge": Bot,
  "Messages": Inbox
};

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  backButtonFallbackPath?: string;
  forceUsePathFallback?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function PageHeader({
  title,
  children,
  showBackButton = true,
  backButtonFallbackPath = "/discover",
  forceUsePathFallback = false,
  className = "",
  showIcon = true
}: PageHeaderProps) {
  const [location] = useLocation();
  
  // Auto-detect if we're on profile page to force fallback
  const isProfilePage = location.startsWith('/profile/');
  const shouldForcePathFallback = forceUsePathFallback || isProfilePage;
  
  // Get the icon component based on the title
  const IconComponent = HEADER_ICONS[title as keyof typeof HEADER_ICONS];
  
  return (
    <header className={`sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border ${className}`}>
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 overflow-visible w-full">
          {showBackButton && (
            <BackButton 
              fallbackPath={backButtonFallbackPath} 
              forceUsePathFallback={shouldForcePathFallback} 
            />
          )}
          <div className="flex items-center gap-2">
            {showIcon && IconComponent && (
              <IconComponent className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            <h1 className="text-xs sm:text-sm font-medium uppercase tracking-wider sm:tracking-[.5em] truncate">
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