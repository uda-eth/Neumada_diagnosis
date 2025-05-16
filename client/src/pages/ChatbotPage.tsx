import { useState, useEffect } from "react";
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
import { GradientHeader } from "@/components/ui/GradientHeader";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { useTranslation } from "@/lib/translations";
import { useLanguage } from "@/lib/language-context";

// Quick prompts for the most common questions with specialized internal prompts
const getQuickPrompts = (t: (key: string) => string, language: string) => [
  {
    text: t('bestRooftops'),
    icon: Wine,
    // What users see
    prompt: language === 'es' 
      ? "¿Cuáles son los mejores bares y restaurantes en azoteas con vistas?" 
      : "What are the best rooftop bars and restaurants with views?",
    // Internal specialized prompt sent to the AI
    specializedPrompt: "What are the rooftops you actually tell your friends about? Not the corporate hotel bars, but places with soul—unexpected views, great music, elevated cocktails, or even hole-in-the-wall gems above the city. Think neighborhood rooftops, secret stairs, or spots where locals linger, not just influencers.",
    ariaLabel: "Find best rooftops"
  },
  {
    text: t('bestDateSpots'),
    icon: HeartHandshake,
    prompt: language === 'es'
      ? "¿Cuáles son los lugares más románticos e impresionantes para una cita?"
      : "What are the most romantic and impressive date spots?",
    specializedPrompt: "Share your go-to spots for a memorable date—places with atmosphere, intention, and a story. Think hidden courtyards, candlelit rooftops, wine bars with character, local chefs doing something special, or even a spot with a perfect view. Avoid the obvious—this is for people who love places that feel discovered, not advertised.",
    ariaLabel: "Find best date spots"
  },
  {
    text: t('bestDayTrips'),
    icon: Plane,
    prompt: language === 'es'
      ? "¿Cuáles son las mejores excursiones de un día desde aquí?"
      : "What are the best day trips from here?",
    specializedPrompt: "What's your favorite escape from the city for the day? Think quiet coastal towns, nature reserves, hot springs, hidden vineyards, artists' enclaves, or food adventures off the beaten path. Skip the tourist-packed landmarks—we want places that feel like secrets worth keeping but only a few hrs away.",
    ariaLabel: "Find best day trips"
  },
  {
    text: t('cityGuide') || "City Guide",
    icon: MapPin,
    prompt: language === 'es'
      ? "¿Cuál es la mejor guía para explorar esta ciudad?"
      : "What's the best guide to explore this city?",
    specializedPrompt: "Imagine you're curating a city guide for someone who's lived in Paris, dined in Tokyo, and hikes on weekends. What are your essential picks—neighborhood walks, independent coffee shops, local mezcalerías, sunset spots, live music dens, family-run kitchens, or under-the-radar galleries? No chains. No clichés. Just places with depth, story, and soul and that are hip.",
    ariaLabel: "City Guide"
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
  const { messages, setMessages, isLoading, sendMessage } = useChat();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [input, setInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mexico City");
  const quickPrompts = getQuickPrompts(t, language);
  
  // Initialize messages with translated greeting
  // Update quick prompts when language changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t('conciergeGreeting')
        }
      ]);
    }
  }, [language, messages, setMessages, t]);

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

  const handleQuickPrompt = async (prompt: string, specializedPrompt?: string) => {
    if (isLoading) return;
    // Create message with city prefix for display purposes
    const message = `[City: ${selectedCity}] ${prompt}`;
    try {
      // Pass both the regular prompt for display and the specialized prompt for AI
      await sendMessage(message, specializedPrompt);
    } catch (error) {
      console.error("Error sending quick prompt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <GradientHeader 
        title={t('concierge')}
        className="mb-4"
        showBackButton={true}
        backButtonFallbackPath="/discover"
      >
        <select 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-transparent border border-border rounded-md px-2 py-1 text-sm focus-visible"
          aria-label="Select a city"
        >
          {DIGITAL_NOMAD_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </GradientHeader>
      
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Card className="flex-1 bg-black/40 border-white/10 shadow-card overflow-hidden">
          <CardContent className="p-4 flex flex-col h-[calc(100vh-16rem)]">
            {/* Quick prompts section */}
            <div className="py-4 border-b border-white/10">
              <div className="flex flex-wrap gap-2 pb-2">
                {quickPrompts.map(({ text, icon: Icon, prompt, specializedPrompt, ariaLabel }: {text: string, icon: any, prompt: string, specializedPrompt: string, ariaLabel: string}) => (
                  <Button
                    key={text}
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 glass-hover flex items-center gap-2 interactive-hover flex-1 min-w-fit"
                    onClick={() => handleQuickPrompt(prompt, specializedPrompt)}
                    disabled={isLoading}
                    aria-label={ariaLabel}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{text}</span>
                  </Button>
                ))}
              </div>
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
                      <span className="text-white/60">{t('findingLocalInsights')}</span>
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
                placeholder={`${t('askAnythingAbout')} ${selectedCity}...`}
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
              {t('premiumAdPartner')}
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