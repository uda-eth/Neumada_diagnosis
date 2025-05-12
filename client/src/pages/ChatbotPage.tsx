import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { 
  Loader2, Send, Bot, User, Globe,
  Wine, HeartHandshake, Plane, 
  Building, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";

// Quick prompts for the most common questions
const quickPrompts = [
  {
    text: "Best Rooftops",
    icon: Wine,
    prompt: "What are the best rooftop bars and restaurants with views?",
    ariaLabel: "Find best rooftops"
  },
  {
    text: "Best Date Spots",
    icon: HeartHandshake,
    prompt: "What are the most romantic and impressive date spots?",
    ariaLabel: "Find best date spots"
  },
  {
    text: "Best Day Trips",
    icon: Plane,
    prompt: "What are the best day trips from here?",
    ariaLabel: "Find best day trips"
  }
];

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
  }
};

export default function ChatbotPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mexico City");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = `[City: ${selectedCity}] ${input.trim()}`;
    setInput("");
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    const message = `[City: ${selectedCity}] ${prompt}`;
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Error sending quick prompt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Card className="flex-1 bg-black/40 border-white/10 shadow-card overflow-hidden">
          <CardContent className="p-4 flex flex-col h-[calc(100vh-16rem)]">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <PageHeader 
                title="Concierge"
                showBackButton={false}
                className="!p-0 !m-0 !border-0 !bg-transparent flex-1"
              />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-sm focus-visible"
                aria-label="Select a city"
              >
                {DIGITAL_NOMAD_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="py-4 border-b border-white/10">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  {quickPrompts.map(({ text, icon: Icon, prompt, ariaLabel }) => (
                    <Button
                      key={text}
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5 glass-hover flex items-center gap-2 interactive-hover whitespace-nowrap"
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      aria-label={ariaLabel}
                    >
                      <Icon className="w-4 h-4" />
                      {text}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1 pr-4 my-4">
              <div className="space-y-4 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex gap-3 mb-4 ${
                        message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "assistant"
                            ? "bg-gradient-to-r from-purple-600 via-pink-600 to-red-500"
                            : "bg-white/10"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-4 max-w-[80%] ${
                          message.role === "assistant"
                            ? "bg-white/5 glass"
                            : "bg-gradient-to-r from-purple-600 via-pink-600 to-red-500"
                        }`}
                      >
                        <div className="text-sm">
                          {message.content.split('\n').map((line, idx) => {
                            // Match numbered list items (1., 2., etc.)
                            if (/^\d+\./.test(line)) {
                              return (
                                <li key={idx} className="pl-2 ml-4 list-item list-decimal">
                                  {line.replace(/^\d+\.\s*/, '')}
                                </li>
                              );
                            }
                            // Match bullet list items
                            else if (line.startsWith('•')) {
                              return (
                                <li key={idx} className="pl-2 ml-4 list-item list-disc">
                                  {line.slice(1).trim()}
                                </li>
                              );
                            }
                            // Regular paragraph text
                            else if (line.trim()) {
                              return <p key={idx} className="mb-2">{line}</p>;
                            }
                            // Empty lines become spacing
                            else {
                              return <div key={idx} className="h-2"></div>;
                            }
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="rounded-lg p-4 bg-white/5 glass flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-white/60">Finding local insights...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form 
              onSubmit={handleSubmit} 
              className="flex gap-2 mt-auto pt-4 border-t border-white/10"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${selectedCity}...`}
                disabled={isLoading}
                className="bg-white/5 border-white/10 glass-hover focus-visible"
                aria-label="Type your message"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-8 interactive-hover"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <p className="text-center text-sm font-medium text-muted-foreground mb-4">
              Premium Ad Partner
            </p>
            <img
              src="/attached_assets/Screenshot 2025-03-05 at 8.12.59 AM.png"
              alt="Premium Ad Partner"
              className="w-full max-w-md mx-auto h-auto object-contain rounded-lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}