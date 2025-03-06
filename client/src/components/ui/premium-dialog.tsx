import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, MessageSquare, Star, Shield, Gift, Zap, Smile } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface PremiumDialogProps {
  children?: React.ReactNode;
  userId?: number;
  mood?: string;
  interests?: string[];
  name?: string;
  status?: string;
}

const getMoodColor = (mood: string) => {
  const moodColors = {
    'Creative': 'from-purple-600 to-pink-600',
    'Adventurous': 'from-blue-600 to-green-600',
    'Relaxed': 'from-green-600 to-teal-600',
    'Energetic': 'from-orange-600 to-red-600',
    'Social': 'from-yellow-600 to-orange-600',
    'Focused': 'from-indigo-600 to-purple-600'
  };
  return moodColors[mood] || 'from-gray-600 to-gray-800';
};

export function PremiumDialog({ children, userId, mood, interests, name, status }: PremiumDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

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
    }
  ];

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userId) {
      setLocation(`/chat/${userId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="bg-gradient-to-r from-purple-900 via-purple-800 to-black hover:from-purple-800 hover:via-purple-700 hover:to-gray-900 text-white border-0"
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium
            </Button>
            <Button
              variant="outline"
              onClick={handleMessageClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] bg-black text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {name && (
              <div className="space-y-1">
                <DialogTitle className="text-xl">{name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{status}</span>
                  {mood && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getMoodColor(mood)} text-white flex items-center gap-1`}>
                      <Smile className="w-3 h-3" />
                      {mood}
                    </span>
                  )}
                </div>
                {interests && interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
              console.log("Subscribe clicked");
            }}
          >
            Apply Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}