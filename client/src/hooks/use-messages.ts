import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: number;
    fullName: string | null;
    profileImage: string | null;
  };
  receiver?: {
    id: number;
    fullName: string | null;
    profileImage: string | null;
  };
}

export interface Conversation {
  user: {
    id: number;
    name: string | null;
    image: string | null;
    username?: string;
    status?: string;
  };
  lastMessage: Message;
  unreadCount?: number;
}

interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  currentSocket: WebSocket | null;
  fetchConversations: (userId: number) => Promise<void>;
  fetchMessages: (userId: number, otherId: number) => Promise<void>;
  sendMessage: (params: { senderId: number; receiverId: number; content: string }) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
  connectSocket: (userId: number) => void;
  disconnectSocket: () => void;
}

export const useMessages = create<MessagesState>((set, get) => ({
  messages: [],
  conversations: [],
  loading: false,
  error: null,
  socketConnected: false,
  currentSocket: null,

  fetchConversations: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/conversations/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching conversations: ${response.statusText}`);
      }
      const data = await response.json();
      set({ conversations: data, loading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        loading: false 
      });
    }
  },

  fetchMessages: async (userId: number, otherId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/messages/${userId}/${otherId}`);
      if (!response.ok) {
        throw new Error(`Error fetching messages: ${response.statusText}`);
      }
      const data = await response.json();
      set({ messages: data, loading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        loading: false 
      });
    }
  },

  sendMessage: async ({ senderId, receiverId, content }) => {
    try {
      set({ loading: true, error: null });
      
      // If WebSocket is connected, send the message through WebSocket
      const { currentSocket, socketConnected } = get();
      if (currentSocket && socketConnected) {
        currentSocket.send(JSON.stringify({
          senderId,
          receiverId,
          content
        }));
        return;
      }
      
      // Otherwise, fall back to REST API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      
      const newMessage = await response.json();
      
      // Update the messages and conversations state with the new message
      const { messages, conversations } = get();
      set({
        messages: [...messages, ...newMessage],
        loading: false
      });
      
      // Update conversations if applicable
      const existingConvIndex = conversations.findIndex(
        c => c.user.id === receiverId
      );
      
      if (existingConvIndex !== -1) {
        const updatedConversations = [...conversations];
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: newMessage[0]
        };
        set({ conversations: updatedConversations });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        loading: false 
      });
    }
  },

  markAsRead: async (messageId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error marking message as read: ${response.statusText}`);
      }
      
      const updatedMessage = await response.json();
      
      // Update the message in the state
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
      
      set({ messages: updatedMessages, loading: false });
    } catch (error) {
      console.error('Error marking message as read:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark message as read', 
        loading: false 
      });
    }
  },

  markAllAsRead: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/messages/read-all/${userId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error marking all messages as read: ${response.statusText}`);
      }
      
      // Update the messages state to mark all as read
      const { messages, conversations } = get();
      const updatedMessages = messages.map(msg => 
        msg.receiverId === userId && !msg.isRead ? { ...msg, isRead: true } : msg
      );
      
      // Update unread counts in conversations
      const updatedConversations = conversations.map(conv => ({
        ...conv,
        unreadCount: 0
      }));
      
      set({ 
        messages: updatedMessages, 
        conversations: updatedConversations,
        loading: false 
      });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark all messages as read', 
        loading: false 
      });
    }
  },

  connectSocket: (userId: number) => {
    // Close any existing connection
    const { currentSocket } = get();
    if (currentSocket) {
      currentSocket.close();
    }
    
    // Connect to WebSocket server
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat/${userId}`);
    const { showNotification } = useMessageNotifications();
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      set({ socketConnected: true, currentSocket: socket });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle confirmation messages
        if (data.type === 'confirmation') {
          // Add the sent message to the state
          const { messages, conversations } = get();
          set({ messages: [...messages, data.message] });
          
          // Update conversations if needed
          const existingConvIndex = conversations.findIndex(
            c => c.user.id === data.message.receiverId
          );
          
          if (existingConvIndex !== -1) {
            const updatedConversations = [...conversations];
            updatedConversations[existingConvIndex] = {
              ...updatedConversations[existingConvIndex],
              lastMessage: data.message
            };
            set({ conversations: updatedConversations });
          }
          
          return;
        }
        
        // Handle error messages
        if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
          set({ error: data.message });
          return;
        }
        
        // Handle new message
        const { messages, conversations, fetchConversations } = get();
        
        // Add the new message to the state
        set({ messages: [...messages, data] });
        
        // Show notification for new messages
        showNotification(data);
        
        // Refresh conversations to show the latest message
        fetchConversations(userId);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ 
        socketConnected: false, 
        error: 'WebSocket connection error' 
      });
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      set({ socketConnected: false, currentSocket: null });
    };
  },

  disconnectSocket: () => {
    const { currentSocket } = get();
    if (currentSocket) {
      currentSocket.close();
      set({ socketConnected: false, currentSocket: null });
    }
  }
}));

export function useMessageNotifications() {
  const { toast } = useToast();
  const { user } = useUser();

  const showNotification = (message: Message) => {
    // Don't show notifications for messages sent by the current user
    if (user && message.senderId === user.id) return;
    
    // Construct a better title using the sender's name if available
    const senderName = message.sender?.fullName || `User ${message.senderId}`;
    
    toast({
      title: `New message from ${senderName}`,
      description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
      duration: 5000,
    });
  };

  return { showNotification };
}