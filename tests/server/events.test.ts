
import request from 'supertest';
import { createApp } from '../../server/app';

describe('Events API', () => {
  let app: Express.Application;
  
  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe('GET /api/events', () => {
    it('should return a list of events', async () => {
      const response = await request(app).get('/api/events');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const event = response.body[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('location');
        expect(event).toHaveProperty('category');
      }
    });

    it('should filter events by location', async () => {
      const location = 'Mexico City';
      const response = await request(app).get(`/api/events?location=${location}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach((event: any) => {
          expect(event.location).toBe(location);
        });
      }
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a specific event by ID', async () => {
      // First get all events to extract a valid ID
      const allEvents = await request(app).get('/api/events');
      
      if (allEvents.body.length > 0) {
        const eventId = allEvents.body[0].id;
        
        const response = await request(app).get(`/api/events/${eventId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', eventId);
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
      }
    });

    it('should return 404 for non-existent event ID', async () => {
      const nonExistentId = 999999;
      const response = await request(app).get(`/api/events/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/events/:eventId/participate', () => {
    it('should update participation status for an event', async () => {
      // First get all events to extract a valid ID
      const allEvents = await request(app).get('/api/events');
      
      if (allEvents.body.length > 0) {
        const eventId = allEvents.body[0].id;
        
        const response = await request(app)
          .post(`/api/events/${eventId}/participate`)
          .send({ status: 'attending' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('eventId', eventId);
        expect(response.body).toHaveProperty('status', 'attending');
      }
    });
  });
});
