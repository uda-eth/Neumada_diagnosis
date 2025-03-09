
import { 
  sendMessage, 
  getConversations, 
  getMessages, 
  markMessageAsRead, 
  markAllMessagesAsRead 
} from '../../../server/services/messagingService';

// Mock data for testing
const mockSender = 1009;
const mockReceiver = 1010;
const mockContent = 'Hello, this is a test message';
const mockMessageId = 1;

describe('Messaging Service', () => {
  describe('sendMessage', () => {
    it('should create and return a new message', async () => {
      const message = await sendMessage({
        senderId: mockSender,
        receiverId: mockReceiver,
        content: mockContent
      });
      
      expect(message).toBeDefined();
      expect(message.senderId).toBe(mockSender);
      expect(message.receiverId).toBe(mockReceiver);
      expect(message.content).toBe(mockContent);
      expect(message.read).toBe(false);
      expect(message.createdAt).toBeDefined();
    });
  });

  describe('getConversations', () => {
    it('should return conversations for a user', async () => {
      const conversations = await getConversations(mockSender);
      
      expect(Array.isArray(conversations)).toBe(true);
      
      if (conversations.length > 0) {
        const conversation = conversations[0];
        expect(conversation).toHaveProperty('userId');
        expect(conversation).toHaveProperty('username');
        expect(conversation).toHaveProperty('fullName');
        expect(conversation).toHaveProperty('profileImage');
        expect(conversation).toHaveProperty('lastMessage');
        expect(conversation).toHaveProperty('unreadCount');
      }
    });
  });

  describe('getMessages', () => {
    it('should return messages between two users', async () => {
      const messages = await getMessages(mockSender, mockReceiver);
      
      expect(Array.isArray(messages)).toBe(true);
      
      if (messages.length > 0) {
        const message = messages[0];
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('senderId');
        expect(message).toHaveProperty('receiverId');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('read');
        expect(message).toHaveProperty('createdAt');
      }
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', async () => {
      const message = await markMessageAsRead(mockMessageId);
      
      expect(message).toBeDefined();
      expect(message.id).toBe(mockMessageId);
      expect(message.read).toBe(true);
    });
  });

  describe('markAllMessagesAsRead', () => {
    it('should mark all messages for a user as read', async () => {
      const messages = await markAllMessagesAsRead(mockReceiver);
      
      expect(Array.isArray(messages)).toBe(true);
      
      if (messages.length > 0) {
        messages.forEach(message => {
          expect(message.receiverId).toBe(mockReceiver);
          expect(message.read).toBe(true);
        });
      }
    });
  });
});
