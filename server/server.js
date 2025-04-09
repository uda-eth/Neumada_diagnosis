const express = require('express');
const app = express();
const cors = require('cors');
const { createServer } = require('http');
const { createApp } = require('./app');

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

async function startServer() {
  try {
    const appInstance = await createApp();
    const httpServer = createServer(appInstance);
    
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();