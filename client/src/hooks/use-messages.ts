import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

interface Conversation {
  user: {
    id: number;
    name: string;
    image: string;
    status?: string;
  };
  lastMessage?: Message;
}

interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: number, otherId: number) => Promise<void>;
  sendMessage: (params: { senderId: number; receiverId: number; content: string }) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  connectSocket: (userId: number) => void;
  disconnectSocket: () => void;
}

export const useMessages = create<MessagesState>((set) => ({
  messages: [],
  conversations: [],
  loading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ loading: true });
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      set({ conversations: data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
      set({ error: message, loading: false });
    }
  },

  fetchMessages: async (userId: number, otherId: number) => {
    try {
      set({ loading: true });
      const response = await fetch(`/api/messages/${userId}/${otherId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      set({ messages: data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: message, loading: false });
    }
  },

  sendMessage: async ({ senderId, receiverId, content }) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ senderId, receiverId, content }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const newMessage = await response.json();
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: message });
    }
  },

  markAsRead: async (messageId: number) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  },

  connectSocket: (userId: number) => {
    // WebSocket connection logic here
    const ws = new WebSocket(`wss://${window.location.host}/ws/chat/${userId}`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      set((state) => ({
        messages: [...state.messages, message]
      }));
    };
  },

  disconnectSocket: () => {
    // WebSocket disconnection logic here
  }
}));

export function useMessageNotifications() {
  const { toast } = useToast();

  const showNotification = (message: Message) => {
    toast({
      title: `New message from ${message.senderId}`,
      description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
      duration: 5000,
    });
  };

  return { showNotification };
}