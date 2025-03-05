import { members } from "@/lib/members-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin } from "lucide-react";

export function ConnectPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Connect</h1>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer">
            <CardContent className="p-0">
              <div className="flex flex-row items-start md:items-center gap-3 p-3 md:p-4">
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg truncate">{member.name}, {member.age}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span className="truncate">{member.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
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
        ))}
      </div>
    </div>
  );
}

export default ConnectPage;