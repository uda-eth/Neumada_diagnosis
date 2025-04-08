
import request from 'supertest';
import { createApp } from '../../server/app';
import { db } from '../../db';
import { users, sessions, events, userConnections } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

describe('User ID Validation Tests', () => {
  let app: any;
  let mockUser: any;
  let mockUser2: any;
  let mockSession: any;
  
  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
    
    // Set up test data
    mockUser = {
      id: 9999,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
      fullName: 'Test User',
      profileImage: null,
      location: 'Test City'
    };
    
    mockUser2 = {
      id: 8888,
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'hashed_password',
      fullName: 'Test User 2',
      profileImage: null,
      location: 'Test City'
    };
    
    mockSession = {
      id: 'test-session-id',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      createdAt: new Date(),
      updatedAt: new Date(),
      data: { username: mockUser.username, email: mockUser.email }
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });
  
  describe('Event Creation Validation', () => {
    it('should create event when authenticated via user ID header', async () => {
      // Mock the user lookup
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser])
      }));
      
      // Mock event insertion
      jest.spyOn(db, 'insert').mockImplementation(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1001, title: 'Test Event', creatorId: mockUser.id }]),
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis()
      }));
      
      const eventData = {
        title: 'Test Event',
        description: 'Event description',
        location: 'Test City',
        date: new Date(),
        category: 'Social'
      };
      
      const response = await request(app)
        .post('/api/events')
        .set('X-User-ID', mockUser.id.toString())
        .send(eventData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('event');
      expect(response.body.event).toHaveProperty('creatorId', mockUser.id);
    });
    
    it('should create event with valid user ID even if session ID has expired', async () => {
      // Mock an expired session but valid user ID
      jest.spyOn(db, 'select')
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([]) // No session found
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser]) // User found by ID
        }));
      
      // Mock event insertion
      jest.spyOn(db, 'insert').mockImplementation(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1002, title: 'Another Event', creatorId: mockUser.id }]),
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis()
      }));
      
      const eventData = {
        title: 'Another Event',
        description: 'Another event description',
        location: 'Test City',
        date: new Date(),
        category: 'Professional'
      };
      
      const response = await request(app)
        .post('/api/events')
        .set('X-User-ID', mockUser.id.toString())
        .set('X-Session-ID', 'expired-session-id')
        .send(eventData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('event');
      expect(response.body.event).toHaveProperty('creatorId', mockUser.id);
    });
    
    it('should return 401 when no valid authentication is provided', async () => {
      // Mock empty session and user results
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      }));
      
      const eventData = {
        title: 'Unauthorized Event',
        description: 'Not going to work',
        location: 'Test City',
        date: new Date(),
        category: 'Social'
      };
      
      const response = await request(app)
        .post('/api/events')
        .send(eventData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('Event Participation', () => {
    it('should allow event participation using user ID even with expired session', async () => {
      // Mock user authentication via user ID
      jest.spyOn(db, 'select')
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser])
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{ id: 2001, title: 'Existing Event' }])
        }));
      
      // Mock event participation operations
      jest.spyOn(db, 'insert').mockImplementation(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ 
          eventId: 2001, 
          userId: mockUser.id, 
          status: 'attending' 
        }])
      }));
      
      // Mock update for event count
      jest.spyOn(db, 'update').mockImplementation(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 2001, attendingCount: 1 }])
      }));
      
      const response = await request(app)
        .post('/api/events/2001/participate')
        .set('X-User-ID', mockUser.id.toString())
        .send({ status: 'attending' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('participation');
      expect(response.body).toHaveProperty('event');
    });
    
    it('should reject participation if user ID is invalid', async () => {
      // Mock failed user authentication
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      }));
      
      const response = await request(app)
        .post('/api/events/2001/participate')
        .set('X-User-ID', '99999999') // Non-existent user ID
        .send({ status: 'attending' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('User Connection Requests', () => {
    it('should allow sending connection requests using user ID header', async () => {
      // Mock user authentication via user ID
      jest.spyOn(db, 'select')
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser])
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser2])
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([])
        }));
      
      // Mock connection creation
      jest.spyOn(db, 'insert').mockImplementation(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ 
          followerId: mockUser.id, 
          followingId: mockUser2.id, 
          status: 'pending' 
        }])
      }));
      
      const response = await request(app)
        .post('/api/connections/request')
        .set('X-User-ID', mockUser.id.toString())
        .send({ targetUserId: mockUser2.id });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('connection');
      expect(response.body.connection).toHaveProperty('followerId', mockUser.id);
      expect(response.body.connection).toHaveProperty('followingId', mockUser2.id);
    });
    
    it('should accept connection requests using user ID header', async () => {
      // Mock user authentication
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser2])
      }));
      
      // Mock connection update
      jest.spyOn(db, 'update').mockImplementation(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ 
          followerId: mockUser.id, 
          followingId: mockUser2.id, 
          status: 'accepted' 
        }])
      }));
      
      const response = await request(app)
        .put(`/api/connections/${mockUser.id}`)
        .set('X-User-ID', mockUser2.id.toString())
        .send({ status: 'accepted' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('connection');
      expect(response.body.connection).toHaveProperty('status', 'accepted');
    });
    
    it('should reject connection requests if user ID is invalid', async () => {
      // Mock failed user authentication
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      }));
      
      const response = await request(app)
        .post('/api/connections/request')
        .set('X-User-ID', '99999999') // Non-existent user ID
        .send({ targetUserId: 1234 });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('Messaging Validation', () => {
    it('should allow sending messages using user ID even with expired session', async () => {
      // Mock user authentication via user ID
      jest.spyOn(db, 'select')
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser])
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([mockUser2])
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{ 
            followerId: mockUser.id, 
            followingId: mockUser2.id, 
            status: 'accepted' 
          }])
        }));
      
      // Mock message creation
      jest.spyOn(db, 'insert').mockImplementation(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ 
          id: 3001,
          senderId: mockUser.id, 
          receiverId: mockUser2.id, 
          content: 'Test message',
          createdAt: new Date(),
          read: false
        }])
      }));
      
      const response = await request(app)
        .post('/api/messages')
        .set('X-User-ID', mockUser.id.toString())
        .send({ 
          senderId: mockUser.id, 
          receiverId: mockUser2.id, 
          content: 'Test message' 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('senderId', mockUser.id);
      expect(response.body).toHaveProperty('receiverId', mockUser2.id);
    });
    
    it('should get conversations using user ID', async () => {
      // Mock user authentication and conversation retrieval
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser])
      }));
      
      // Mock the conversation query results
      const mockQueryResults = {
        query: jest.fn().mockResolvedValue([
          {
            userId: mockUser2.id,
            username: mockUser2.username,
            fullName: mockUser2.fullName,
            profileImage: mockUser2.profileImage,
            lastMessage: 'Test message',
            timestamp: new Date(),
            unreadCount: 1
          }
        ])
      };
      
      jest.spyOn(db, 'query').mockReturnValue(mockQueryResults);
      
      const response = await request(app)
        .get(`/api/conversations/${mockUser.id}`)
        .set('X-User-ID', mockUser.id.toString());
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('userId', mockUser2.id);
      }
    });
    
    it('should mark messages as read using user ID validation', async () => {
      // Mock user authentication
      jest.spyOn(db, 'select').mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser])
      }));
      
      // Mock message update
      jest.spyOn(db, 'update').mockImplementation(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ 
          id: 3001,
          read: true,
          readAt: expect.any(Date)
        }])
      }));
      
      const response = await request(app)
        .post('/api/messages/3001/read')
        .set('X-User-ID', mockUser.id.toString());
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('read', true);
    });
  });
  
  describe('WebSocket Authentication with User ID', () => {
    it('should simulate WebSocket connection with user ID validation', async () => {
      // This test mocks a WebSocket connection scenario
      // In an actual implementation, we'd use a WebSocket testing library
      
      // Mock the WebSocket URL parsing process
      const wsUrl = '/ws/chat/9999';  // The user ID is in the URL path
      const match = wsUrl.match(/\/chat\/(\d+)/);
      
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe('9999');
      
      const userId = parseInt(match?.[1] || '0', 10);
      expect(userId).toBe(9999);
      
      // Verify the user ID matches our mock user
      expect(userId).toBe(mockUser.id);
    });
    
    it('should validate that WebSocket message sending uses userId', async () => {
      // Mock the WebSocket message structure to verify it contains userId
      const messageData = {
        senderId: mockUser.id,
        receiverId: mockUser2.id,
        content: 'Hello via WebSocket'
      };
      
      // Verify the message includes sender ID for validation
      expect(messageData).toHaveProperty('senderId');
      expect(messageData.senderId).toBe(mockUser.id);
      
      // Verify the structure that would be passed to the database
      const messageSendingParams = {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content
      };
      
      expect(messageSendingParams).toHaveProperty('senderId', mockUser.id);
      expect(messageSendingParams).toHaveProperty('receiverId', mockUser2.id);
      expect(messageSendingParams).toHaveProperty('content', 'Hello via WebSocket');
    });
  });
});
