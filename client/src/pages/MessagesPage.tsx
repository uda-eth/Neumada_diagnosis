import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useMessages, useMessageNotifications } from "@/hooks/use-messages";
import { members } from "@/lib/members-data";

// Generate relevant messages based on mood
const getMoodMessage = (mood: string) => {
  const messages = {
    "Networking": [
      "Would love to discuss potential collaboration opportunities! ☕️",
      "Your recent project caught my attention. Let's connect!",
      "Looking to expand my professional network here in the city.",
    ],
    "Dating": [
      "Hey! Want to grab coffee at that new place downtown? 😊",
      "Loved your travel photos! Where was that taken?",
      "I know this amazing rooftop bar with great views...",
    ],
    "Parties": [
      "Don't forget about tonight's event at Condesa! 🎉",
      "Are you going to the art gallery opening this weekend?",
      "Just got VIP passes for the new club opening! Interested?",
    ],
    "Adventure": [
      "Planning a hike this weekend, want to join? 🏔️",
      "Found this amazing hidden spot in the city!",
      "Up for some urban exploration tomorrow?",
    ],
    "Dining Out": [
      "Have you tried that new fusion place in Roma? 🍜",
      "Know any good spots for authentic Mexican food?",
      "Found an amazing hidden gem restaurant yesterday!",
    ]
  };

  return messages[mood][Math.floor(Math.random() * messages[mood].length)];
};

// Mock conversations for demo with mood-based messages
const mockConversations = members.slice(0, 5).map(member => ({
  id: member.id,
  user: member,
  lastMessage: {
    content: getMoodMessage(member.currentMood),
    timestamp: new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute:'2-digit',
      hour12: false 
    }),
    unread: Math.random() > 0.5,
  }
}));

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const messageStore = useMessages();
  const { showNotification } = useMessageNotifications();

  useEffect(() => {
    messageStore.markAllAsRead();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Search Bar */}
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

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-4 space-y-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <Card
                key={conv.id}
                className="hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => setLocation(`/chat/${conv.user.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={conv.user.image} />
                    <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate">{conv.user.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {conv.lastMessage.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      conv.lastMessage.unread 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground"
                    }`}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No messages found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}