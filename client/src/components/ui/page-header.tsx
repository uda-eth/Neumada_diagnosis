import React from 'react';
import { BackButton } from '@/components/ui/back-button';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  backButtonFallbackPath?: string;
  className?: string;
}

export function PageHeader({
  title,
  children,
  showBackButton = true,
  backButtonFallbackPath = "/discover",
  className = ""
}: PageHeaderProps) {
  return (
    <header className={`sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <BackButton fallbackPath={backButtonFallbackPath} />
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