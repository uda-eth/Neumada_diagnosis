import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useReferral } from '@/hooks/use-referral';

type ContentType = 'event' | 'profile' | 'invite';

interface ReferralShareButtonProps extends ButtonProps {
  contentType: ContentType;
  contentId?: string | number;
  title?: string;
  text?: string;
  showIcon?: boolean;
  className?: string;
}

export function ReferralShareButton({
  contentType,
  contentId,
  title,
  text,
  showIcon = true,
  className = '',
  children,
  ...props
}: ReferralShareButtonProps) {
  const { shareContent } = useReferral();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent element clicks (useful for cards)
    shareContent(contentType, contentId, title, text);
  };

  return (
    <Button
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
      {...props}
    >
      {showIcon && <Share2 className="h-4 w-4" />}
      {children || 'Share'}
    </Button>
  );
}