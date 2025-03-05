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

      <div className="space-y-4">
        {members.map((member) => (
          <Link key={member.id} href={`/profile/${member.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Card className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer group">
              <CardContent className="p-0">
                <div className="flex flex-row items-start md:items-center gap-3 p-3 md:p-4">
                  <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base md:text-lg truncate">{member.name}, {member.age}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`${moodStyles[member.currentMood]} text-xs px-2 py-0.5 transition-colors`}
                          >
                            {member.currentMood}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="truncate">{member.location}</span>
                        </div>
                      </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
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

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {member.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground mt-2">
                      {member.occupation}
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