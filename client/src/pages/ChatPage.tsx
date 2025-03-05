import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Send } from "lucide-react";
import { members } from "@/lib/members-data";
import { useMessages } from "@/hooks/use-messages";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sent: boolean;
  content: string;
  timestamp?: string;
}

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

export default function ChatPage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messageStore = useMessages();

  // Find the member based on the URL parameter
  const member = members.find(
    (m) => m.name.toLowerCase().replace(/\s+/g, '-') === username
  );

  useEffect(() => {
    if (member) {
      // Initialize with some example messages based on member's mood
      setMessages([
        { sent: false, content: `Hey! I see you're interested in ${member.interests[0]}!`, timestamp: "10:30" },
        { sent: true, content: "Yes! Always excited to connect with people who share similar interests.", timestamp: "10:31" },
        { sent: false, content: `I'm currently in ${member.location}. Would love to meet up!`, timestamp: "10:32" }
      ]);
    }
  }, [member]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sent: true,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate a response after a short delay
    setTimeout(() => {
      const response = {
        sent: false,
        content: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  if (!member) {
    return <div className="p-4">Member not found</div>;
  }

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
              onClick={() => setLocation("/messages")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={member.image} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{member.name}</h1>
              <p className="text-sm text-muted-foreground">{member.currentMood}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[calc(100vh-8rem)] py-4">
        <div className="container mx-auto px-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[80%] group">
                  {!message.sent && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.sent
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                    {message.timestamp && (
                      <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                        <span>{message.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
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