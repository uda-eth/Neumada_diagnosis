import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event } from '@db/schema';

export function useEvents(category?: string, location?: string) {
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['events', category, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      
      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'creatorId' | 'createdAt'>) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const participateInEvent = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update participation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEvent.mutateAsync,
    participateInEvent: participateInEvent.mutateAsync,
  };
}
