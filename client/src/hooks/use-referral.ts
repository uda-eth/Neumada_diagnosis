import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'event' | 'profile' | 'invite';

export function useReferral() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Get user's referral code
  const { data: referralData, isLoading, error } = useQuery({
    queryKey: ['/api/referral/code'],
    queryFn: async () => {
      const response = await fetch('/api/referral/code', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error fetching referral code: ${response.status}`);
      }

      return response.json();
    },
    // Don't refetch on window focus to avoid too many API calls
    refetchOnWindowFocus: false,
  });

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

  // Copy share link to clipboard
  const copyShareLink = async (type: ContentType, id?: string | number, customToast = true) => {
    try {
      const shareLink = await getShareLink(type, id);
      
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      
      if (customToast) {
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
          variant: "default",
        });
      }
      
      setTimeout(() => setIsCopied(false), 2000);
      return shareLink;
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
      return null;
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
      // If Web Share API is not available, fall back to clipboard
      return copyShareLink(type, id);
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
    referralCode: referralData?.referralCode,
    isLoading,
    error,
    isCopied,
    getShareLink,
    copyShareLink,
    shareContent
  };
}