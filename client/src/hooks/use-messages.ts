import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    name: string;
    image: string;
  };
  createdAt: string;
}

interface Conversation {
  user: {
    id: number;
    name: string;
    image: string;
  };
  lastMessage?: Message;
}

interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: number) => Promise<void>;
  sendMessage: (content: string, to: { id: number; name: string }) => Promise<void>;
}

// Mock conversations for demo
const mockConversations = [
  {
    user: {
      id: 1009,
      name: "Luca Hudek",
      image: "/attached_assets/Screenshot 2025-03-04 at 11.21.13 PM.png"
    },
  },
  {
    user: {
      id: 1010,
      name: "Maria Torres",
      image: "/attached_assets/profile-image-1.jpg"
    },
  },
  {
    user: {
      id: 1011,
      name: "James Chen",
      image: "/attached_assets/profile-image-2.jpg"
    }
  }
];

export const useMessages = create<MessagesState>((set) => ({
  messages: [],
  conversations: [],
  loading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ loading: true });
      // For now, return mock conversations
      set({ conversations: mockConversations, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
      set({ error: message, loading: false });
    }
  },

  fetchMessages: async (userId: number) => {
    try {
      set({ loading: true });
      // For now, return empty messages array
      set({ messages: [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: message, loading: false });
    }
  },

  sendMessage: async (content: string, to: { id: number; name: string }) => {
    try {
      const newMessage = {
        id: Date.now(),
        content,
        sender: {
          id: 0, // Guest user ID
          name: "Guest",
          image: "/default-avatar.png"
        },
        createdAt: new Date().toISOString()
      };

      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: message });
    }
  }
}));

export function useMessageNotifications() {
  const { toast } = useToast();

  const showNotification = (message: Message) => {
    toast({
      title: `New message from ${message.sender.name}`,
      description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
      duration: 5000,
    });
  };

  return { showNotification };
}