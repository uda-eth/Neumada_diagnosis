
import { 
  sendMessage, 
  getConversations, 
  getMessages, 
  markMessageAsRead 
} from "../../../server/services/messagingService";

describe("Messaging Service", () => {
  describe("sendMessage", () => {
    it("should create a new message", async () => {
      const message = await sendMessage({
        senderId: 1009,
        receiverId: 1010,
        content: "Test message"
      });
      
      expect(message).toHaveProperty("id");
      expect(message).toHaveProperty("senderId", 1009);
      expect(message).toHaveProperty("receiverId", 1010);
      expect(message).toHaveProperty("content", "Test message");
      expect(message).toHaveProperty("createdAt");
      expect(message).toHaveProperty("read", false);
    });
  });

  describe("getConversations", () => {
    it("should return user conversations", async () => {
      const conversations = await getConversations(1009);
      expect(Array.isArray(conversations)).toBe(true);
    });
  });

  describe("getMessages", () => {
    it("should return messages between two users", async () => {
      // First, create a test message
      await sendMessage({
        senderId: 1009,
        receiverId: 1010,
        content: "Another test message"
      });
      
      const messages = await getMessages(1009, 1010);
      expect(Array.isArray(messages)).toBe(true);
      
      if (messages.length > 0) {
        expect(messages[0]).toHaveProperty("id");
        expect(messages[0]).toHaveProperty("content");
      }
    });
  });

  describe("markMessageAsRead", () => {
    it("should mark a message as read", async () => {
      // Create a message first
      const message = await sendMessage({
        senderId: 1010,
        receiverId: 1009,
        content: "Message to be marked as read"
      });
      
      const updatedMessage = await markMessageAsRead(message.id);
      expect(updatedMessage).toHaveProperty("id", message.id);
      expect(updatedMessage).toHaveProperty("read", true);
    });
  });
});
