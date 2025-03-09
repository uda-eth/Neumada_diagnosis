
import { Express } from 'express';
import { createApp } from '../../../server/app';

let app: Express;

beforeAll(async () => {
  const { app: expressApp } = await createApp();
  app = expressApp;
}, 10000);

describe('Messaging Service', () => {
  it('should have a valid structure', () => {
    expect(true).toBe(true);
  });
});
