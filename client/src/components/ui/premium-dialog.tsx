import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, MessageSquare, Star, Shield, Gift, Zap } from "lucide-react";
import { useState } from "react";

interface PremiumDialogProps {
  children?: React.ReactNode;
}

export function PremiumDialog({ children }: PremiumDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      icon: Gift,
      title: "Access to Exclusive Events",
      description: "Gain insider details on afterparties, VIP gatherings, and premium happenings"
    },
    {
      icon: Star,
      title: "Profile Enhancements",
      description: "Upload more photos, utilize advanced dating filters, and enjoy personalized profile customization"
    },
    {
      icon: Shield,
      title: "Dedicated Customer Support",
      description: "Experience priority assistance from our specialized support team"
    },
    {
      icon: Zap,
      title: "Ad Customization",
      description: "Choose to see tailored ads from brands you love or opt for an ad-free experience"
    },
    {
      icon: Gift,
      title: "Event Creation & Monetization",
      description: "Organize events and earn directly from ticket sales"
    },
    {
      icon: MessageSquare,
      title: "Premium Networking",
      description: "Connect and message exclusively with other Premium Members, talents, artists, and influencers worldwide"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline"
            className="bg-gradient-to-r from-purple-900 via-purple-800 to-black hover:from-purple-800 hover:via-purple-700 hover:to-gray-900 text-white border-0"
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] bg-black text-white overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-purple-400" />
            Unlock the World with Maly Premium
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Maximize your Maly experience for less than $1/day
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-2 rounded-lg hover:bg-white/5">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold">$29</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-purple-900 via-purple-800 to-black hover:from-purple-800 hover:via-purple-700 hover:to-gray-900 text-white border-0"
            onClick={() => {
              // TODO: Implement subscription flow
              console.log("Subscribe clicked");
            }}
          >
            Subscribe Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}