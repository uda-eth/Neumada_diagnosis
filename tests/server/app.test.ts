
import request from 'supertest';
import { getTestApp } from '../utils/test-utils';

describe('Server App', () => {
  let app: any;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it('should respond with 404 for unknown route', async () => {
    const response = await request(app).get('/api/non-existent-route');
    expect(response.status).toBe(404);
  });

  // You can add more tests here
});
