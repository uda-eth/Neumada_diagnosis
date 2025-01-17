import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
  isMe: boolean;
}

interface Chat {
  id: number;
  user: {
    name: string;
    title?: string;
    avatar?: string;
    isOnline: boolean;
  };
  messages: Message[];
}

// Mock data for demo
const mockChat: Chat = {
  id: 1,
  user: {
    name: "Claire",
    title: "Digital Marketing Manager",
    isOnline: true,
  },
  messages: [
    {
      id: 1,
      content: "Hey, great to meet you last night!",
      timestamp: "16:55",
      sender: "Claire",
      isMe: false,
    },
    {
      id: 2,
      content: "Hey, let's do brunch?",
      timestamp: "16:55",
      sender: "Me",
      isMe: true,
    },
  ],
};

const quickReplies = [
  "Sure, let's meet!",
  "Thanks for the invite",
  "I'll get back to you",
  "Sounds good",
];

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockChat.messages);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      sender: "Me",
      isMe: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60"
              onClick={() => setLocation("/messages")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">{mockChat.user.name}</h1>
              {mockChat.user.title && (
                <p className="text-sm text-white/60">{mockChat.user.title}</p>
              )}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback>{mockChat.user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[calc(100vh-8rem)] py-4">
        <div className="container mx-auto px-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {!message.isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-[#E8E8E8] text-black"
                  }`}
                >
                  <p className="text-[15px]">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          {/* Quick Replies */}
          <ScrollArea className="whitespace-nowrap mb-4" orientation="horizontal">
            <div className="flex gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => setNewMessage(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
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
              className="flex-1 bg-white/5 border-white/10"
            />
          </form>
        </div>
      </div>
    </div>
  );
}