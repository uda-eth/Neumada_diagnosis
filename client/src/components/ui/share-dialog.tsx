import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
  onGenerateNewLink?: () => void;
}

export function ShareDialog({ isOpen, onClose, shareLink, onGenerateNewLink }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Private join link</DialogTitle>
              <DialogDescription>
                Anyone with this link can edit files
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={shareLink}
              readOnly
              className="select-all bg-muted"
            />
          </div>
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? "Copied!" : "Copy join link"}
          </Button>
        </div>
        {onGenerateNewLink && (
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground">
              Want to revoke access to this link?{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-primary"
                onClick={onGenerateNewLink}
              >
                Generate a new link
              </Button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
