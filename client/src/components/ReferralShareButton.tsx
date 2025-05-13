import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2, Link2, MessageSquare, Mail } from 'lucide-react';
import { SiWhatsapp, SiGmail } from "react-icons/si";
import { useReferral } from '@/hooks/use-referral';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/hooks/use-user';

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
  title = "Check this out on Maly",
  text = "I thought you might be interested in this",
  showIcon = true,
  className = '',
  children,
  ...props
}: ReferralShareButtonProps) {
  const { getShareLink } = useReferral();
  const { user } = useUser();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Open share dialog and get share link
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent element clicks (useful for cards)
    
    try {
      const url = await getShareLink(contentType, contentId);
      setShareUrl(url || `https://malymvp.replit.app/${contentType}/${contentId || ''}`);
      setShowShareDialog(true);
    } catch (err) {
      console.error("Error fetching share link:", err);
      // Fallback URL if API fails
      setShareUrl(`https://malymvp.replit.app/${contentType}/${contentId || ''}`);
      setShowShareDialog(true);
    }
  };

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  
  // Handle share via email
  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `${user?.fullName || user?.username || 'I'} thought you might be interested in this: ${text}\n\n${shareUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareDialog(false);
  };
  
  // Handle share via WhatsApp
  const handleShareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `${text} ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowShareDialog(false);
  };
  
  // Handle share via SMS
  const handleShareViaSMS = () => {
    const message = encodeURIComponent(
      `${text} ${shareUrl}`
    );
    window.location.href = `sms:?&body=${message}`;
    setShowShareDialog(false);
  };

  // Check if children contains a Share2 icon to avoid duplication
  const hasShareIconInChildren = React.Children.toArray(children).some(child => 
    React.isValidElement(child) && 
    child.type === Share2
  );

  return (
    <>
      <Button
        onClick={handleShare}
        className={`flex items-center gap-2 ${className}`}
        {...props}
      >
        {showIcon && !hasShareIconInChildren && <Share2 className="h-4 w-4" />}
        {children || 'Share'}
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent aria-describedby="share-dialog-description">
          <DialogHeader>
            <DialogTitle>Share {contentType === 'profile' ? 'profile' : contentType === 'event' ? 'event' : 'invitation'}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p id="share-dialog-description" className="text-sm text-muted-foreground mb-4">
              Share this {contentType} with friends via:
            </p>
            
            <div className="flex items-center space-x-2 mb-6">
              <div className="grid flex-1 gap-2">
                <input
                  value={shareUrl}
                  readOnly
                  className="select-all bg-muted p-2 rounded text-sm"
                />
              </div>
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Link2 className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 p-3"
                onClick={handleShareViaEmail}
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 p-3"
                onClick={handleShareViaWhatsApp}
              >
                <SiWhatsapp className="h-5 w-5" />
                <span>WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 p-3"
                onClick={handleShareViaSMS}
              >
                <MessageSquare className="h-5 w-5" />
                <span>SMS</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="default" onClick={() => setShowShareDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}