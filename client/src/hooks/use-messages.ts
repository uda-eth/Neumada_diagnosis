import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  user: {
    id: number;
    name: string;
    image: string;
  };
  lastMessage: Message;
}

interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  socket: WebSocket | null;
  sendMessage: (message: { senderId: number; receiverId: number; content: string }) => Promise<void>;
  fetchConversations: (userId: number) => Promise<void>;
  fetchMessages: (userId: number, otherId: number) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
  connectSocket: (userId: number) => void;
  disconnectSocket: () => void;
}

export const useMessages = create<MessagesState>((set, get) => ({
  messages: [],
  conversations: [],
  unreadCount: 0,
  loading: false,
  error: null,
  socket: null,

  sendMessage: async (message) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage = await response.json();
      set((state) => ({
        messages: [...state.messages, newMessage],
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchConversations: async (userId) => {
    try {
      set({ loading: true });
      const response = await fetch(`/api/conversations/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const conversations = await response.json();
      set({ conversations, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMessages: async (userId, otherId) => {
    try {
      set({ loading: true });
      const response = await fetch(`/api/messages/${userId}/${otherId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();
      set({ messages, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      const updatedMessage = await response.json();
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await fetch(`/api/messages/read-all/${userId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all messages as read');
      set((state) => ({
        messages: state.messages.map((msg) => ({ ...msg, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  connectSocket: (userId) => {
    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        set((state) => ({
          messages: [...state.messages, data.message],
          unreadCount: state.unreadCount + 1,
        }));
      }
    };

    socket.onclose = () => {
      setTimeout(() => get().connectSocket(userId), 1000);
    };

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },
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