
import { type Express } from 'express';
import { createApp } from '../../server/app';

// Cache the app instance to avoid creating multiple instances
let app: Express;
let httpServer: any;

export async function getTestApp(): Promise<Express> {
  if (!app) {
    // Only create the app once
    const result = await createApp();
    app = result.app;
    httpServer = result.httpServer;
  }
  return app;
}

// Clean up function for after tests
export async function closeTestApp(): Promise<void> {
  if (httpServer) {
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
  }
}
