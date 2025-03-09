import request from 'supertest';
import { app } from '../../server/app';

describe('Auth API', () => {
  it('POST /api/auth/login should validate credentials', async () => {
    // Test with invalid credentials
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    // We don't know the exact behavior yet, but we can expect either a 401 (Unauthorized) 
    // or a 400 (Bad Request) if the credentials are invalid
    expect([400, 401]).toContain(response.status);
  });

  it('GET /api/auth/me should require authentication', async () => {
    const response = await request(app).get('/api/auth/me');

    // Without auth, this should be unauthorized
    expect([401, 403]).toContain(response.status);
  });
});

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