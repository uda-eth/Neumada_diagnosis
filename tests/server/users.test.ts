
import request from "supertest";
import { createApp } from "../../server/app";

describe("Users API", () => {
  let app: any;

  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe("GET /api/users/browse", () => {
    it("should return filtered users based on city", async () => {
      const response = await request(app).get("/api/users/browse?city=Mexico%20City");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("fullName");
      }
    });

    it("should filter users by gender if specified", async () => {
      const response = await request(app).get("/api/users/browse?city=Mexico%20City&gender=male");
      expect(response.status).toBe(200);
      
      // Check that all returned users have gender=male
      if (response.body.length > 0) {
        response.body.forEach((user: any) => {
          if (user.gender) {
            expect(user.gender).toBe("male");
          }
        });
      }
    });
  });

  describe("GET /api/users/:username", () => {
    it("should return a specific user by username", async () => {
      // First, get a list of users to find a valid username
      const usersResponse = await request(app).get("/api/users/browse?city=Mexico%20City");
      expect(usersResponse.status).toBe(200);
      
      if (usersResponse.body.length > 0) {
        const username = usersResponse.body[0].username;
        
        const response = await request(app).get(`/api/users/${username}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("username", username);
      }
    });

    it("should return 404 for non-existent username", async () => {
      const response = await request(app).get("/api/users/nonexistentuser123456");
      expect(response.status).toBe(404);
    });
  });
});
