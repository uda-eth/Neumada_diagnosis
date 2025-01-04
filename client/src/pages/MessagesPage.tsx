import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video } from "lucide-react";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
  isMe: boolean;
}

interface Conversation {
  id: number;
  user: {
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

// Mock data
const conversations: Conversation[] = [
  {
    id: 1,
    user: {
      name: "Sarah Miller",
      isOnline: true,
    },
    lastMessage: "Looking forward to the meetup!",
    timestamp: "2 min ago",
    unread: 2,
  },
  {
    id: 2,
    user: {
      name: "David Chen",
      isOnline: false,
    },
    lastMessage: "Thanks for the coworking space recommendation",
    timestamp: "1 hour ago",
    unread: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: 1,
    content: "Hey! I saw you're also in Bali right now?",
    timestamp: "10:30 AM",
    sender: "Sarah Miller",
    isMe: false,
  },
  {
    id: 2,
    content: "Yes! Just arrived yesterday. Would love to connect!",
    timestamp: "10:32 AM",
    sender: "Me",
    isMe: true,
  },
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: messages.length + 1,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: "Me",
      isMe: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[350px,1fr] gap-4 max-w-6xl mx-auto">
          {/* Conversations List */}
          <Card className="md:max-h-[calc(100vh-8rem)] overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setActiveConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeConversation?.id === conversation.id
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{conversation.user.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          {activeConversation ? (
            <Card className="md:max-h-[calc(100vh-8rem)] overflow-hidden">
              <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)]">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeConversation.user.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {activeConversation.user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } rounded-lg px-4 py-2`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
