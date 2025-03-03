import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

interface MessagesState {
  messages: Message[];
  unreadCount: number;
  addMessage: (message: Omit<Message, 'id' | 'read'>) => void;
  markAsRead: (messageId: number) => void;
  markAllAsRead: () => void;
}

export const useMessages = create<MessagesState>((set) => ({
  messages: [],
  unreadCount: 0,
  addMessage: (message) => 
    set((state) => {
      const newMessage = {
        ...message,
        id: Date.now(),
        read: false,
      };
      return {
        messages: [...state.messages, newMessage],
        unreadCount: state.unreadCount + 1,
      };
    }),
  markAsRead: (messageId) =>
    set((state) => {
      const messages = state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      const unreadCount = messages.filter((msg) => !msg.read).length;
      return { messages, unreadCount };
    }),
  markAllAsRead: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, read: true })),
      unreadCount: 0,
    })),
}));

export function useMessageNotifications() {
  const { toast } = useToast();
  
  const showNotification = (message: Message) => {
    toast({
      title: `New message from ${message.sender}`,
      description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
      duration: 5000,
    });
  };

  return { showNotification };
}
