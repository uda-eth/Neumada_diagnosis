import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Send, Bot, User } from "lucide-react";
import { members } from "@/lib/members-data";
import { useMessages } from "@/hooks/use-messages";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced loading animation variants
const loadingVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

// Message animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

// Generate a mock conversation based on the member's mood
const generateMockConversation = (memberMood: string) => {
  const moodBasedMessages = {
    "Networking": [
      { sent: false, content: "Hi! I saw you're also in tech. Would love to connect!" },
      { sent: true, content: "Absolutely! Always excited to meet fellow professionals." },
      { sent: false, content: "Would love to discuss potential collaboration opportunities! ☕️" }
    ],
    "Dating": [
      { sent: false, content: "That cafe you mentioned looks amazing!" },
      { sent: true, content: "It's one of my favorite spots in the city 😊" },
      { sent: false, content: "Hey! Want to grab coffee there sometime?" }
    ],
    "Parties": [
      { sent: false, content: "Are you going to the gallery opening tonight? 🎨" },
      { sent: true, content: "Haven't decided yet! What time does it start?" },
      { sent: false, content: "Don't forget about tonight's event at Condesa! 🎉" }
    ],
    "Adventure": [
      { sent: false, content: "Planning a hike to Desierto de los Leones this weekend!" },
      { sent: true, content: "That sounds amazing! What time are you heading out?" },
      { sent: false, content: "Planning a hike this weekend, want to join? 🏔️" }
    ],
    "Dining Out": [
      { sent: false, content: "Have you tried the new place in Roma Norte?" },
      { sent: true, content: "Not yet! What kind of food do they serve?" },
      { sent: false, content: "Have you tried that new fusion place in Roma? 🍜" }
    ]
  };

  return moodBasedMessages[memberMood as keyof typeof moodBasedMessages] || moodBasedMessages["Networking"];
};

export default function ChatPage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageStore = useMessages();

  // Find the member based on the URL parameter
  const member = members.find(
    (m) => m.name.toLowerCase().replace(/\s+/g, '-') === username
  );

  useEffect(() => {
    if (member) {
      // Load mock conversation based on member's mood
      setMessages(generateMockConversation(member.currentMood));
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
  };

  if (!member) {
    return <div>User not found</div>;
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
              <p className="text-sm text-muted-foreground">{member.occupation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[calc(100vh-8rem)] py-4">
        <div className="container mx-auto px-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
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
                  <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                    <span>{message.timestamp || "12:00"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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