import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { Loader2, Send, Bot, User, Globe, MapPin, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

// Quick prompt suggestions for travelers
const quickPrompts = [
  "Best cafes for digital nomads",
  "Local cultural experiences",
  "Safe neighborhoods to stay",
  "Upcoming community events",
  "Transportation tips",
  "Cost of living insights"
];

export default function ChatbotPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    setInput("");
    await sendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <Card className="max-w-2xl mx-auto h-[80vh] flex flex-col bg-black/40 border-white/10">
        <CardContent className="flex-1 p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-medium uppercase tracking-[.5em]">Travel Companion</h1>
          </div>

          {/* Quick Prompts */}
          <ScrollArea className="flex-none py-4 whitespace-nowrap">
            <div className="flex gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  {prompt}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4 my-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 mb-4 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
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
                        ? "bg-white/5"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="rounded-lg p-4 bg-white/5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-white/60">Searching travel insights...</span>
                </div>
              </motion.div>
            )}
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your travel destination..."
              disabled={isLoading}
              className="bg-white/5 border-white/10"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}