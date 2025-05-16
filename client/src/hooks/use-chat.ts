import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isEventQuery, parseFiltersFromText } from '@/utils/parseEventsFilter';
import { fetchEvents } from '@/utils/fetchEvents';
import { useLanguage } from '@/lib/language-context';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export function useChat() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi, I'm Maly — like your local friend with great taste. I'll help you know where to go, who to know, and what to do.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      
      // Add user message to chat (stripping any city prefix)
      const cleanMessage = message.replace(/\[City: [^\]]+\]/, '').trim();
      setMessages(prev => [...prev, { role: 'user', content: cleanMessage }]);
      
      // Extract city from message prefix (if present)
      const cityMatch = message.match(/\[City: ([^\]]+)\]/);
      const extractedCity = cityMatch ? cityMatch[1] : undefined;
      
      // Check if this is an event-related query
      const isAboutEvents = isEventQuery(cleanMessage);
      
      if (isAboutEvents) {
        console.log('Detected event query:', cleanMessage);
        
        // Parse event filters from the message
        const filters = parseFiltersFromText(cleanMessage);
        
        // Use explicitly selected city from UI if present, otherwise use city extracted from message
        if (extractedCity && !filters.city) {
          filters.city = extractedCity;
        }
        
        console.log('Parsed filters:', filters);
        
        // Fetch matching events from our API
        const events = await fetchEvents(filters);
        
        if (events.length > 0) {
          // Build the AI prompt with specific events
          const eventsPrompt = `
You are Maly, our event concierge. Based on the user's question: "${cleanMessage}"

Use ONLY the following events from our database:
${events.map((event, index) => `
EVENT ${index + 1}: ${event.title}
- ID: ${event.id}
- Category: ${event.category}
- Date: ${event.humanReadableDate || new Date(event.date).toLocaleDateString()}
- Location: ${event.location}
- Price: ${event.price === '0' ? 'Free' : '$' + event.price}
- Description: ${event.description?.slice(0, 100)}${event.description?.length > 100 ? '...' : ''}
`).join('\n')}

Respond in a friendly, helpful tone. Only mention events from the list above. 
If specific events match what the user is looking for better than others, highlight those events. 
Include the event details in your answer (title, date, location, price).
Do NOT search the internet or mention any events not in the list above.
`;

          // Send to OpenAI with the specific events
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: cleanMessage,
              context: eventsPrompt,
              language: language
            }),
          });
          
          if (!response.ok) {
            throw new Error(await response.text());
          }
          
          const data = await response.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
          
        } else {
          // No events found
          const noEventsPrompt = `
You are Maly, an event concierge. The user asked about events: "${cleanMessage}"

Unfortunately, I couldn't find any events in our database matching those criteria. 
In your response:
1. Apologize that you couldn't find matching events
2. Suggest they try broader search terms or different dates
3. Ask if they would like information about other aspects of the city instead

Do NOT make up events or search the internet for events.
`;

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: cleanMessage,
              context: noEventsPrompt,
              language: language
            }),
          });
          
          if (!response.ok) {
            throw new Error(await response.text());
          }
          
          const data = await response.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        }
        
      } else {
        // Not an event query, use the standard city concierge response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message,
            context: `You are a knowledgeable AI city concierge specializing in local experiences and recommendations.
            Focus on providing practical, up-to-date information specifically for ${extractedCity || 'the selected city'} about:
            - Local neighborhoods and best areas
            - Coworking spaces and cafes suitable for remote work
            - Best restaurants and dining experiences
            - Cultural spots and community events
            - Transportation and getting around

            Keep responses focused only on ${extractedCity || 'the selected city'}.
            Provide specific venue names and locations when possible.
            Keep responses concise but informative.`
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
      
    } catch (error: any) {
      console.error('Chat error:', error);
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