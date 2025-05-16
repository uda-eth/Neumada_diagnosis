import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event, NewEvent } from '@db/schema';
import { useTranslation } from '@/lib/translations';
import { useState, useEffect } from 'react';

export function useEvents(category?: string, location?: string) {
  const queryClient = useQueryClient();
  const { language, translateEvent } = useTranslation();
  const [translatedEvents, setTranslatedEvents] = useState<Event[]>([]);

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events', category, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (location) params.append('location', location);

      const response = await fetch(`/api/events?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
  });
  
  // Translate events when they're loaded or language changes
  useEffect(() => {
    const translateAllEvents = async () => {
      if (events && events.length > 0 && language !== 'en') {
        try {
          console.log(`Translating ${events.length} events to ${language}`);
          const translated = await Promise.all(
            events.map(event => translateEvent(event, language))
          );
          setTranslatedEvents(translated);
        } catch (error) {
          console.error("Error translating events:", error);
          setTranslatedEvents(events); // Fallback to original data
        }
      } else if (events) {
        // For English, use original data
        setTranslatedEvents(events);
      }
    };
    
    translateAllEvents();
  }, [events, language, translateEvent]);

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<NewEvent, 'id' | 'creatorId' | 'createdAt'>) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });

  return {
    events: translatedEvents.length > 0 ? translatedEvents : events,
    originalEvents: events,
    isLoading,
    error,
    createEvent: createEvent.mutateAsync,
  };
}