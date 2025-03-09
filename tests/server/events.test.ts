
import request from "supertest";
import { createApp } from "../../server/app";

describe("Events API", () => {
  let app: any;

  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe("GET /api/events", () => {
    it("should return events for a specific location", async () => {
      const response = await request(app).get("/api/events?location=Mexico%20City");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const event = response.body[0];
        expect(event).toHaveProperty("id");
        expect(event).toHaveProperty("title");
        expect(event).toHaveProperty("description");
        expect(event).toHaveProperty("date");
        expect(event).toHaveProperty("location");
      }
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return a specific event by ID", async () => {
      // First, get a list of events to find a valid ID
      const eventsResponse = await request(app).get("/api/events?location=Mexico%20City");
      expect(eventsResponse.status).toBe(200);
      
      if (eventsResponse.body.length > 0) {
        const eventId = eventsResponse.body[0].id;
        
        const response = await request(app).get(`/api/events/${eventId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", eventId);
        expect(response.body).toHaveProperty("title");
        expect(response.body).toHaveProperty("description");
      }
    });

    it("should return 404 for non-existent event ID", async () => {
      const response = await request(app).get("/api/events/99999999");
      expect(response.status).toBe(404);
    });
  });
});
