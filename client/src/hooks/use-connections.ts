
import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Connection {
  id: number;
  requesterId: number;
  recipientId: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

interface ConnectionContextType {
  sendRequest: (recipientId: number) => Promise<void>;
  acceptRequest: (connectionId: number) => Promise<void>;
  declineRequest: (connectionId: number) => Promise<void>;
  connections: Connection[];
  pendingRequests: Connection[];
  isLoading: boolean;
}

export const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function useConnections(userId: number) {
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections', userId],
    queryFn: () => fetch(`/api/connections/${userId}`).then(res => res.json()),
  });

  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingRequests', userId],
    queryFn: () => fetch(`/api/connections/pending/${userId}`).then(res => res.json()),
  });

  const sendRequest = useCallback(async (recipientId: number) => {
    await fetch('/api/connections/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: userId, recipientId }),
    });
    queryClient.invalidateQueries(['connections']);
  }, [userId, queryClient]);

  const updateRequest = useCallback(async (connectionId: number, status: 'accepted' | 'declined') => {
    await fetch(`/api/connections/${connectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries(['connections']);
    queryClient.invalidateQueries(['pendingRequests']);
  }, [queryClient]);

  return {
    connections,
    pendingRequests,
    isLoading: connectionsLoading || pendingLoading,
    sendRequest,
    acceptRequest: (connectionId: number) => updateRequest(connectionId, 'accepted'),
    declineRequest: (connectionId: number) => updateRequest(connectionId, 'declined'),
  };
}
