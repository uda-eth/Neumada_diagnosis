import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging middleware
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
    // Kill any existing process on port 5000
    try {
      const { execSync } = require('child_process');
      execSync('lsof -ti :5000 | xargs kill -9', { stdio: 'ignore' });
    } catch (err) {
      // Ignore errors if no process was found or on Windows
    }

    // Small delay to ensure port is released
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { httpServer } = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error but don't fail on missing API keys
      if (message.includes("API key")) {
        console.warn("API key warning:", message);
        return res.status(200).json({ message: "Using fallback mode without API keys" });
      }

      res.status(status).json({ message });
    });

    // Setup Vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    const PORT = 5000;
    let retries = 0;
    const maxRetries = 3;

    const startServer = () => {
      httpServer.listen(PORT, "0.0.0.0")
        .on("error", (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE' && retries < maxRetries) {
            retries++;
            log(`Port ${PORT} is in use, attempting to close existing connection... (attempt ${retries}/${maxRetries})`);
            setTimeout(startServer, 1000);
          } else {
            log(`Failed to start server: ${error}`);
            process.exit(1);
          }
        })
        .on("listening", () => {
          log(`Server started on port ${PORT}`);
        });
    };

    startServer();

    // Graceful shutdown handler
    const cleanup = () => {
      httpServer.close(() => {
        log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    log(`Error setting up server: ${error}`);
    process.exit(1);
  }
})();