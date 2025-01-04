import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // Setup vite in development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try to start server on available port
    const tryPort = async (port: number): Promise<number> => {
      try {
        await new Promise<void>((resolve, reject) => {
          server.listen(port, "0.0.0.0")
            .once('listening', () => {
              log(`Server started on port ${port}`);
              resolve();
            })
            .once('error', (err: any) => {
              if (err.code === 'EADDRINUSE') {
                server.close();
                reject(err);
              } else {
                reject(err);
              }
            });
        });
        return port;
      } catch (err) {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${port} in use, trying next port`);
          return tryPort(port + 1);
        }
        throw err;
      }
    };

    await tryPort(5000);
  } catch (err) {
    log(`Failed to start server: ${err}`);
    process.exit(1);
  }
})();