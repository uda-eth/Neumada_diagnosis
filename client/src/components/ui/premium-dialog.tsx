import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, Sparkles, Gift, Shield, Zap } from "lucide-react";
import { useState } from "react";

interface PremiumDialogProps {
  children?: React.ReactNode;
}

export function PremiumDialog({ children }: PremiumDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      icon: Star,
      title: "Custom Brand Ads",
      description: "See personalized ads from brands you love"
    },
    {
      icon: Crown,
      title: "Profile Upgrades",
      description: "Stand out with enhanced profile features"
    },
    {
      icon: Gift,
      title: "Premium Events",
      description: "Exclusive access to premium events"
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get help when you need it most"
    },
    {
      icon: Sparkles,
      title: "Enhanced Discovery",
      description: "Better visibility in search and recommendations"
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Early access to new features"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
          >
            <Crown className="w-4 h-4 mr-2" />
            Get Premium
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-amber-400" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unlock exclusive features and enhance your experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-2 rounded-lg hover:bg-white/5">
              <feature.icon className="w-5 h-5 text-amber-400 mt-1" />
              <div>
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">$29</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
              onClick={() => {
                // TODO: Implement subscription flow
                console.log("Subscribe clicked");
              }}
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}