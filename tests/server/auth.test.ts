
import request from 'supertest';
import { createApp } from '../../server/app';

describe('Authentication API', () => {
  let app: Express.Application;
  const testUser = {
    username: `test_user_${Date.now()}`,
    password: 'test_password',
    fullName: 'Test User',
    bio: 'This is a test user',
    location: 'Test City',
    interests: ['Testing', 'Coding']
  };
  
  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(testUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('fullName', testUser.fullName);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ username: 'user_without_password' });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for username that already exists', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(testUser);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    it('should login a user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should return 400 for incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'wrong_password'
        });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/user', () => {
    it('should return user data for authenticated user', async () => {
      // First login to get authenticated
      const agent = request.agent(app);
      await agent
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      const response = await agent.get('/api/user');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/user');
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/logout', () => {
    it('should log out an authenticated user', async () => {
      // First login to get authenticated
      const agent = request.agent(app);
      await agent
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      const logoutResponse = await agent.post('/api/logout');
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('message', 'Logged out successfully');
      
      // Verify the user is logged out
      const userResponse = await agent.get('/api/user');
      expect(userResponse.status).toBe(401);
    });
  });
});
