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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className="relative h-64 md:h-72">
                  <img
                    src={`/attached_assets${member.image}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}, {member.age}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {member.location}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle message action
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {member.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
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