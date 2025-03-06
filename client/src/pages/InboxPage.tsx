import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

// Mock data for inbox messages
const mockMessages = [
  {
    id: 1,
    sender: {
      name: "Sofia Rodriguez",
      avatar: "/attached_assets/profile-image-1.jpg",
      initials: "SR"
    },
    preview: "Hey! Are you coming to the art exhibition tonight?",
    timestamp: "2025-03-06T10:30:00",
    unread: true
  },
  {
    id: 2,
    sender: {
      name: "Marcus Chen",
      avatar: "/attached_assets/profile-image-2.jpg",
      initials: "MC"
    },
    preview: "Great meeting you at the digital nomad meetup!",
    timestamp: "2025-03-05T15:45:00",
    unread: false
  },
  {
    id: 3,
    sender: {
      name: "Luna Park",
      avatar: "/attached_assets/profile-image-3.jpg",
      initials: "LP"
    },
    preview: "About the upcoming tech conference...",
    timestamp: "2025-03-05T09:15:00",
    unread: true
  }
];

export default function InboxPage() {
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
            <h1 className="text-lg font-semibold">Inbox</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {mockMessages.map((message) => (
            <Card
              key={message.id}
              className={`hover:bg-accent/5 cursor-pointer transition-colors ${
                message.unread ? "bg-accent/10" : ""
              }`}
              onClick={() => setLocation(`/chat/${message.sender.name.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>{message.sender.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{message.sender.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.preview}
                    </p>
                  </div>
                  {message.unread && (
                    <Badge variant="default" className="ml-2">
                      New
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
