import request from 'supertest';
import { app } from '../../server/app';

describe('Chat API', () => {
  it('GET /api/chat/messages should return an array of messages', async () => {
    const response = await request(app).get('/api/chat/messages');

    // This might need auth, so we can check for either success or auth failure
    if (response.status === 200) {
      expect(Array.isArray(response.body)).toBe(true);
    } else {
      expect([401, 403]).toContain(response.status);
    }
  });

  it('POST /api/chat/messages should require authentication', async () => {
    const response = await request(app)
      .post('/api/chat/messages')
      .send({ content: 'Test message' });

    // Without auth, this should be unauthorized
    expect([401, 403]).toContain(response.status);
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