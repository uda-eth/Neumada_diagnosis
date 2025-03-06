import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

// Mock data for inbox messages
const mockMessages = [
  {
    id: 1,
    sender: {
      name: "Sofia Rodriguez",
      avatar: "/attached_assets/profile-elena.jpg",
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
      avatar: "/attached_assets/profile-miguel.jpg",
      initials: "LP"
    },
    preview: "About the upcoming tech conference...",
    timestamp: "2025-03-05T09:15:00",
    unread: true
  },
  {
    id: 4,
    sender: {
      name: "Alex Thompson",
      avatar: "/attached_assets/marco_profile.jpg",
      initials: "AT"
    },
    preview: "Let's collaborate on the new project!",
    timestamp: "2025-03-04T18:20:00",
    unread: false
  },
  {
    id: 5,
    sender: {
      name: "Maya Patel",
      avatar: "/attached_assets/profile-image-1.jpg",
      initials: "MP"
    },
    preview: "Thanks for the coworking space recommendation",
    timestamp: "2025-03-04T14:10:00",
    unread: false
  },
  {
    id: 6,
    sender: {
      name: "David Kim",
      avatar: "/attached_assets/profile-image-3.jpg",
      initials: "DK"
    },
    preview: "Joining for sunset yoga at the beach?",
    timestamp: "2025-03-04T11:30:00",
    unread: false
  },
  {
    id: 7,
    sender: {
      name: "Emma Wilson",
      avatar: "/attached_assets/profile-image-4.jpg",
      initials: "EW"
    },
    preview: "Looking forward to the weekend hiking trip!",
    timestamp: "2025-03-04T09:45:00",
    unread: false
  }
];

export default function InboxPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = mockMessages.filter(message =>
    message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              className="pl-9 bg-accent/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`hover:bg-accent/5 cursor-pointer transition-colors ${
                message.unread ? "bg-accent/10" : ""
              }`}
              onClick={() => setLocation(`/chat/${message.sender.name.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
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
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}