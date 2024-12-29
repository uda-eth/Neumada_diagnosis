import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, UserPlus2 } from "lucide-react";
import { motion } from "framer-motion";

interface Match {
  userId: number;
  score: number;
  compatibility_reason: string;
}

export default function MatchesPage() {
  const [, setLocation] = useLocation();
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="text-white/60">Finding your perfect travel buddies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-sm font-medium uppercase tracking-[.5em]">Travel Buddies</h1>
          <p className="text-white/60 mt-2">
            Find like-minded travelers who share your interests and travel style
          </p>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches?.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {match.userId.toString()[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Match Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Travel Buddy #{match.userId}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={match.score} className="w-32 h-2" />
                            <span className="text-sm text-white/60">
                              {match.score}% Match
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-white/80 text-sm">
                        {match.compatibility_reason}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4">
                        <Button className="w-full" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          <UserPlus2 className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
