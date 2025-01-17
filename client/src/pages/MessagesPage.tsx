import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Globe, Languages } from "lucide-react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "../../../server/services/translationService";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
  isMe: boolean;
  originalLanguage?: string;
  translatedContent?: string;
}

interface Chat {
  id: number;
  user: {
    name: string;
    title?: string;
    avatar?: string;
    isOnline: boolean;
    language?: string;
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
    language: "fr", // French
  },
  messages: [
    {
      id: 1,
      content: "Salut, ravi de t'avoir rencontré hier soir!",
      translatedContent: "Hey, great to meet you last night!",
      originalLanguage: "fr",
      timestamp: "16:55",
      sender: "Claire",
      isMe: false,
    },
    {
      id: 2,
      content: "Hey, let's do brunch?",
      originalLanguage: "en",
      timestamp: "16:55",
      sender: "Me",
      isMe: true,
    },
  ],
};

const quickReplies = [
  "Nice to meet you!",
  "Let's meet for coffee",
  "Are you free today?",
  "Thanks for the invite",
  "See you soon!",
  "What's your favorite spot here?",
  "Any recommendations?"
];

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockChat.messages);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || isTranslating) return;

    setIsTranslating(true);
    try {
      // In a real app, this would call the translation service
      const translatedContent = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newMessage,
          targetLanguage: mockChat.user.language || 'en'
        })
      }).then(res => res.json());

      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        translatedContent: translatedContent.translation,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        sender: "Me",
        isMe: true,
        originalLanguage: selectedLanguage,
      };

      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error('Translation error:', error);
      // Handle error appropriately
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
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
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 hover:bg-white/10">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={mockChat.user.avatar} />
              <AvatarFallback className="bg-primary/20">{mockChat.user.name[0]}</AvatarFallback>
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
              <div className="flex items-end gap-2 max-w-[80%] group">
                {!message.isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockChat.user.avatar} />
                    <AvatarFallback className="bg-primary/20">{message.sender[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    message.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                  {message.translatedContent && (
                    <p className="text-[13px] mt-1.5 opacity-80 leading-relaxed">
                      {message.translatedContent}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs opacity-60 mt-2">
                    <span>{message.timestamp}</span>
                    {message.originalLanguage && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {message.originalLanguage.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          {/* Quick Replies */}
          <div className="pb-4 mb-4 border-b border-white/10">
            <ScrollArea>
              <div className="flex gap-2 pb-2">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply}
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10 whitespace-nowrap"
                    onClick={() => setNewMessage(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

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
              placeholder={`Type a message in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}...`}
              className="flex-1 bg-white/5 border-white/10 focus:border-white/20"
              disabled={isTranslating}
            />
            <Button 
              type="submit" 
              disabled={isTranslating || !newMessage.trim()}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}