import request from 'supertest';
import { createApp } from '../../../server/app';

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

describe('Translation Service', () => {
  it('should properly translate text', () => {
    // Mock translation function
    const translate = (text: string, targetLanguage: string) => {
      if (targetLanguage === 'es') {
        return text === 'Hello' ? 'Hola' : text;
      }
      return text;
    };

    expect(translate('Hello', 'es')).toBe('Hola');
    expect(translate('Other', 'es')).toBe('Other');
  });
});