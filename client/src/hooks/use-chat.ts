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
      content: "Hello! I'm Maly your chat based concierge. I'll help you discover the best local spots while living or traveling abroad. What would you like to know about your city of interest?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          context: `You are a knowledgeable AI city guide concierge specializing in digital nomad lifestyle and local experiences. 
          Focus on providing practical, up-to-date information about:
          - Coworking spaces and cafes suitable for remote work
          - Local neighborhoods and accommodation recommendations
          - Cultural insights and community events
          - Cost of living and practical tips
          - Transportation and getting around
          - Food and entertainment spots
          - Safety and essential services

          Always consider the specific city mentioned in the query and tailor your responses accordingly.
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
        description: error.message || 'Failed to get response from the city guide concierge',
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