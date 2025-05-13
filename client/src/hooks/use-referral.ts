import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'event' | 'profile' | 'invite';

export function useReferral() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Get share link for a specific content
  const getShareLink = async (type: ContentType, id?: string | number) => {
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('type', type);
      if (id) params.append('id', String(id));
      
      const response = await fetch(`/api/referral/share-link?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error fetching share link: ${response.status}`);
      }

      const data = await response.json();
      return data.shareUrl;
    } catch (error) {
      console.error('Error fetching share link:', error);
      // Fallback URL if the API fails
      return `https://malymvp.replit.app${id ? `/${type}/${id}` : ''}`;
    }
  };

  // Handle Web Share API (for mobile devices)
  const shareContent = async (
    type: ContentType, 
    id?: string | number, 
    title = "Maly", 
    text = "Check this out on Maly!"
  ) => {
    if (!navigator.share) {
      // If Web Share API is not available, use our custom share dialog through ReferralShareButton
      toast({
        title: "Sharing not supported",
        description: "Use the share dialog to copy the link instead",
        variant: "default",
      });
      return false;
    }

    try {
      const shareLink = await getShareLink(type, id);
      
      await navigator.share({
        title,
        text,
        url: shareLink,
      });
      
      return true;
    } catch (err) {
      // Ignore AbortError as it happens when user cancels share
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing:", err);
        toast({
          title: "Share failed",
          description: "Could not share content",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  return {
    isCopied,
    getShareLink,
    shareContent
  };
}