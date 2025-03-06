import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Crown, Star, Shield, Gift, Zap, MessageSquare } from "lucide-react";

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

export default function PremiumPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-400" />
              <h1 className="text-lg font-semibold">Premium Benefits</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Unlock the World with Maly Premium
            </h2>
            <p className="text-muted-foreground text-lg">
              Maximize your Maly experience for less than $1/day
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card hover:bg-accent/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block rounded-lg bg-card p-8 mb-6">
              <div className="text-4xl font-bold mb-2">$29</div>
              <div className="text-muted-foreground">per month</div>
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-900 via-purple-800 to-black hover:from-purple-800 hover:via-purple-700 hover:to-gray-900 text-white border-0 px-8"
                onClick={() => {
                  // TODO: Implement subscription flow
                  console.log("Subscribe clicked");
                }}
              >
                <Crown className="w-5 h-5 mr-2" />
                Get Premium Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
