import { useQuery } from '@tanstack/react-query';
import type { Event } from '@db/schema';

export interface RecommendedEvent extends Event {
  tags: string[];
  attendingCount: number;
  interestedCount: number;
}

export function useRecommendedEvents() {
  const { data: events, isLoading, error } = useQuery<RecommendedEvent[]>({
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