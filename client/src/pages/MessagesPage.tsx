import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useMessages } from "@/hooks/use-messages";
import { useUser } from "@/hooks/use-user";

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const { conversations, loading, error, fetchConversations } = useMessages();

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  // Check if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-lg">Create a free account to start messaging</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect with other members by creating your profile
          </p>
          <Button className="mt-4" onClick={() => setLocation("/auth")}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-accent rounded w-1/4" />
                      <div className="h-3 bg-accent/50 rounded w-3/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchConversations()}
              >
                Retry
              </Button>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
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
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm truncate text-muted-foreground">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Start a conversation by visiting someone's profile</p>
              <Button className="mt-4" onClick={() => setLocation("/")}>
                Browse Members
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}