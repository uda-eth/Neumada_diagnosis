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
      content: "Hello! I'm your AI travel companion for exploring the digital nomad lifestyle. I can help you discover local spots, connect with fellow travelers, and make the most of your journey. What would you like to know about your current or next destination?",
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
          context: "You are a knowledgeable AI travel companion specializing in digital nomad lifestyle, local experiences, and cultural insights. Focus on providing personalized recommendations and practical advice for travelers."
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
        description: error.message || 'Failed to get response from the travel companion',
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