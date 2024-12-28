import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event, NewEvent } from '@db/schema';

export function useEvents(category?: string, location?: string) {
  const queryClient = useQueryClient();

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
    events,
    isLoading,
    error,
    createEvent: createEvent.mutateAsync,
  };
}