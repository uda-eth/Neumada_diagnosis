
import request from 'supertest';
import { createApp } from '../../server/app';

describe('Chat API', () => {
  let app: Express.Application;
  
  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe('POST /api/chat', () => {
    it('should respond to a chat message', async () => {
      const message = 'What are the best restaurants in Mexico City?';
      
      const response = await request(app)
        .post('/api/chat')
        .send({ message, context: { city: 'Mexico City' } });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });

    it('should categorize messages about restaurants correctly', async () => {
      const message = 'Where can I find good food in Mexico City?';
      
      const response = await request(app)
        .post('/api/chat')
        .send({ message, context: { city: 'Mexico City' } });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response).toContain('restaurant'); // This is a simplification, real check would be more robust
    });

    it('should categorize messages about workspaces correctly', async () => {
      const message = 'What are good coworking spaces in Mexico City?';
      
      const response = await request(app)
        .post('/api/chat')
        .send({ message, context: { city: 'Mexico City' } });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response).toContain('work'); // This is a simplification, real check would be more robust
    });

    it('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ context: { city: 'Mexico City' } });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
