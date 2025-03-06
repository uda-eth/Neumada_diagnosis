import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

// Mock conversations data
const mockConversations = [
  {
    user: {
      id: 1,
      name: "John Doe",
      image: "/attached_assets/profile-image-2.jpg",
      status: "Online"
    },
    lastMessage: {
      content: "Hey! How are you?",
      createdAt: new Date().toISOString()
    }
  },
  {
    user: {
      id: 2,
      name: "Maria Torres",
      image: "/attached_assets/profile-image-1.jpg",
      status: "Away"
    },
    lastMessage: {
      content: "The event was amazing!",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  },
  {
    user: {
      id: 3,
      name: "James Chen",
      image: "/attached_assets/profile-image-3.jpg",
      status: "Online"
    },
    lastMessage: {
      content: "Looking forward to the meetup",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  }
];

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = mockConversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
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
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Messages</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm border-b border-accent">
        <div className="container mx-auto px-4 py-3">
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
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-4 space-y-2">
          {filteredConversations.map((conv) => (
            <Card
              key={conv.user.id}
              className="hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => setLocation(`/chat/${conv.user.id}`)}
            >
              <div className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                  <AvatarImage src={conv.user.image} alt={conv.user.name} />
                  <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{conv.user.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>
                  <p className="text-sm truncate text-muted-foreground">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}