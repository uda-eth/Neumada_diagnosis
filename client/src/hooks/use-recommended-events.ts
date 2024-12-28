import { useQuery } from '@tanstack/react-query';
import type { Event } from '@db/schema';

export function useRecommendedEvents() {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events/recommended'],
    queryFn: async () => {
      const response = await fetch('/api/events/recommended', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
  });

  return {
    recommendedEvents: events,
    isLoading,
    error,
  };
}
