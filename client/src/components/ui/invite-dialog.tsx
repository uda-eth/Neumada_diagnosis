import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Share2, Mail, MessageSquare, Send } from "lucide-react";
import { SiGmail, SiWhatsapp } from "react-icons/si";

const INVITE_URL = "https://maly.repl.app/join";

// Share message and links defined at module level so they're accessible to all components
const shareMessage = encodeURIComponent(
  "Join me on Maly - the digital nomad community platform! 🌎✨"
);

const shareLinks = {
  gmail: `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=&su=${encodeURIComponent(
    "Join me on Maly!"
  )}&body=${shareMessage}%0A%0A${INVITE_URL}`,
  whatsapp: `https://wa.me/?text=${shareMessage}%20${INVITE_URL}`,
  sms: `sms:?&body=${shareMessage}%20${INVITE_URL}`,
};

export function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex items-center text-foreground"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Share Maly with your friends and grow your digital nomad network.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.gmail, '_blank')}
          >
            <SiGmail className="h-5 w-5" />
            Gmail
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          >
            <SiWhatsapp className="h-5 w-5" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.sms)}
          >
            <MessageSquare className="h-5 w-5" />
            SMS
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 text-sm text-muted-foreground overflow-hidden">
            <p className="truncate">{INVITE_URL}</p>
          </div>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(INVITE_URL);
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InviteTrigger() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-[10px] font-medium">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Share Maly with your friends and grow your digital nomad network.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.gmail, '_blank')}
          >
            <SiGmail className="h-5 w-5" />
            Gmail
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          >
            <SiWhatsapp className="h-5 w-5" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => window.open(shareLinks.sms)}
          >
            <MessageSquare className="h-5 w-5" />
            SMS
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 text-sm text-muted-foreground overflow-hidden">
            <p className="truncate">{INVITE_URL}</p>
          </div>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(INVITE_URL);
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}