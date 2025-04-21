import React from 'react';
import { BackButton } from '@/components/ui/back-button';
import { useLocation } from 'wouter';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  backButtonFallbackPath?: string;
  forceUsePathFallback?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  children,
  showBackButton = true,
  backButtonFallbackPath = "/discover",
  forceUsePathFallback = false,
  className = ""
}: PageHeaderProps) {
  const [location] = useLocation();
  
  // Auto-detect if we're on profile page to force fallback
  const isProfilePage = location.startsWith('/profile/');
  const shouldForcePathFallback = forceUsePathFallback || isProfilePage;
  
  return (
    <header className={`sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <BackButton 
              fallbackPath={backButtonFallbackPath} 
              forceUsePathFallback={shouldForcePathFallback} 
            />
          )}
          <h1 className="text-sm font-medium uppercase tracking-wider">
            {title}
          </h1>
          {children && (
            <div className="ml-auto flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}