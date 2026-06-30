/**
 * Server Configuration
 * @module server
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

// ==================== ENVIRONMENT VALIDATION ====================
const requiredEnvVars = ['PORT', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

// ==================== UNHANDLED REJECTIONS & EXCEPTIONS ====================
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// ==================== REGISTER MODELS ====================
// Register models before connecting to DB so they get synced
require('./src/models');

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = (server, signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    console.error('Shutdown timeout. Forcefully exiting...');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    clearTimeout(shutdownTimeout);
    console.log('Closing MongoDB connection...');
    
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      console.log('Server shut down gracefully.');
      process.exit(0);
    } catch (err) {
      console.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });
};

// ==================== INITIALIZE SERVER ====================
let serverInstance = null;

const initializeServer = async () => {
  const server = await startServer();
  serverInstance = server;

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, () => {
      gracefulShutdown(serverInstance, signal);
    });
  });
};

// ==================== START APPLICATION ====================
initializeServer().catch((err) => {
  console.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;