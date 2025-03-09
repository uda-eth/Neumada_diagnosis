import request from 'supertest';
import { app } from '../../server/app';

describe('Users API', () => {
  it('GET /api/users should return an array of users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/users/:id should return a single user or 404', async () => {
    // First get all users to find a valid ID
    const allUsers = await request(app).get('/api/users');

    if (allUsers.body.length > 0) {
      const firstUserId = allUsers.body[0].id;
      const response = await request(app).get(`/api/users/${firstUserId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', firstUserId);
    } else {
      // If no users exist, test for a 404 with a made-up ID
      const response = await request(app).get('/api/users/nonexistent-id');
      expect(response.status).toBe(404);
    }
  });
  describe('GET /api/users/:city', () => {
    it('should return users from a specific city', async () => {
      const city = 'Mexico City';
      const response = await request(app).get(`/api/users/${city}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('fullName');
      }
    });
  });

  describe('GET /api/users/browse', () => {
    it('should return filtered users', async () => {
      const response = await request(app)
        .get('/api/users/browse')
        .query({ city: 'Mexico City' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter users by gender', async () => {
      const gender = 'female';
      const response = await request(app)
        .get('/api/users/browse')
        .query({ gender });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach((user: any) => {
          expect(user.gender).toBe(gender);
        });
      }
    });

    it('should filter users by age range', async () => {
      const minAge = 25;
      const maxAge = 35;
      const response = await request(app)
        .get('/api/users/browse')
        .query({ minAge, maxAge });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach((user: any) => {
          if (user.age) {
            expect(user.age).toBeGreaterThanOrEqual(minAge);
            expect(user.age).toBeLessThanOrEqual(maxAge);
          }
        });
      }
    });
  });

  describe('GET /api/users/:username', () => {
    it('should return a specific user by username', async () => {
      // First get all users to extract a valid username
      const allUsers = await request(app).get('/api/users/Mexico City');
      
      if (allUsers.body.length > 0) {
        const username = allUsers.body[0].username;
        
        const response = await request(app).get(`/api/users/${username}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', username);
      }
    });

    it('should return 404 for non-existent username', async () => {
      const nonExistentUsername = 'non_existent_user_123456';
      const response = await request(app).get(`/api/users/${nonExistentUsername}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});