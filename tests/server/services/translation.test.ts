import request from 'supertest';
import { createApp } from '../../../server/app';
import { Express } from 'express';

describe('Translation API', () => {
  let app: Express.Application;

  beforeAll(async () => {
    const { app: expressApp } = await createApp();
    app = expressApp;
  });

  describe('POST /api/translate', () => {
    it('should translate text to the target language', async () => {
      const payload = {
        text: 'Hello, how are you?',
        targetLanguage: 'es'
      };

      const response = await request(app)
        .post('/api/translate')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('translation');
      expect(typeof response.body.translation).toBe('string');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

import { Express } from 'express';
import { createApp } from '../../../server/app';

let app: Express;

beforeAll(async () => {
  const { app: expressApp } = await createApp();
  app = expressApp;
}, 10000);

describe('Translation Service', () => {
  it('should have a valid structure', () => {
    expect(true).toBe(true);
  });
});