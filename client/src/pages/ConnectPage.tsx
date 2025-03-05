import { members } from "@/lib/members-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin, UserCircle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "wouter";

// Mood badge styles configuration
const moodStyles = {
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30"
} as const;

export function ConnectPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Connect</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {members.map((member) => (
          <Link key={member.id} href={`/profile/${member.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Card className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer group h-full">
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  {/* Image Container - Larger on desktop */}
                  <div className="relative w-full aspect-[4/3] md:aspect-[3/4] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover object-[center_25%] transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                    {/* Content overlaid on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-xl text-white truncate">
                              {member.name}, {member.age}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`${moodStyles[member.currentMood]} text-xs px-2 py-0.5 transition-colors`}
                            >
                              {member.currentMood}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-white/80">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="truncate">{member.location}</span>
                          </div>
                          <p className="text-sm text-white/70 line-clamp-2">
                            {member.occupation}
                          </p>
                        </div>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white hover:text-white/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80" align="end">
                            <div className="flex flex-col space-y-2">
                              <p className="text-sm font-medium">Message {member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Start a conversation about {member.interests[0].toLowerCase()} or other shared interests
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  </div>

                  {/* Additional info section below image */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ConnectPage;