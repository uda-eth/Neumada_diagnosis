import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Maly your local city concierge. I'll help you discover the best spots in your chosen city. What would you like to know?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: message.replace(/\[City: [^\]]+\]/, '').trim() }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          context: `You are a knowledgeable AI city concierge specializing in local experiences and recommendations.
          Focus on providing practical, up-to-date information specifically for the selected city about:
          - Local neighborhoods and best areas
          - Coworking spaces and cafes suitable for remote work
          - Best restaurants and dining experiences
          - Cultural spots and community events
          - Transportation and getting around

          Keep responses focused only on the selected city.
          Provide specific venue names and locations when possible.
          Keep responses concise but informative.`
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get response from the city concierge',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
}