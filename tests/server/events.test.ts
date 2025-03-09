import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../server/app';

describe('Events API', () => {
  let app: Express.Application;

  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  it('GET /api/events should return an array of events', async () => {
    const response = await request(app).get('/api/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/events/:id should return a single event or 404', async () => {
    // First get all events to find a valid ID
    const allEvents = await request(app).get('/api/events');

    if (allEvents.body.length > 0) {
      const firstEventId = allEvents.body[0].id;
      const response = await request(app).get(`/api/events/${firstEventId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', firstEventId);
    } else {
      // If no events exist, test for a 404 with a made-up ID
      const response = await request(app).get('/api/events/nonexistent-id');
      expect(response.status).toBe(404);
    }
  });
});