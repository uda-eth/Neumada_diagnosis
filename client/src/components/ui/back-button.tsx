import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  fallbackPath?: string;
}

export function BackButton({ 
  className = "", 
  variant = "ghost", 
  fallbackPath = "/discover" 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to fallback path
      setLocation(fallbackPath);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={`text-white/60 hover:text-white ${className}`}
      onClick={handleBack}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}