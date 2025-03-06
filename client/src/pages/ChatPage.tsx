import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Send } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { motion, AnimatePresence } from "framer-motion";

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Mock data for development
const mockUser = {
  id: 1,
  name: "Current User",
  image: "/attached_assets/profile-image-1.jpg"
};

export default function ChatPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hey! How are you?",
      senderId: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      content: "I'm good, thanks! How about you?",
      senderId: 1,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Mock other user data
  const otherUser = {
    id: 2,
    fullName: "John Doe",
    profileImage: "/attached_assets/profile-image-2.jpg",
    status: "Online"
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      content: newMessage,
      senderId: mockUser.id,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLocation("/messages")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={otherUser.profileImage} />
              <AvatarFallback>{otherUser.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{otherUser.fullName}</h1>
              <p className="text-sm text-muted-foreground">{otherUser.status}</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-8rem)] py-4" ref={scrollAreaRef}>
        <div className="container mx-auto px-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${message.senderId === mockUser.id ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[80%] group">
                  {message.senderId !== mockUser.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherUser.profileImage} />
                      <AvatarFallback>{otherUser.fullName[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.senderId === mockUser.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                    <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}