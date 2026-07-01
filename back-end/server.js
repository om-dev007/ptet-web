/**
 * Server Configuration
 * @module server
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const mongoose = require('mongoose');
const logger = require("./src/utils/serverLogger");


const PORT = process.env.PORT || 5000;

// ==================== ENVIRONMENT VALIDATION ====================
const validateEnv = require("./src/config/validateEnv");
validateEnv();

// ==================== UNHANDLED REJECTIONS & EXCEPTIONS ====================
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
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
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = (server, signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timeout. Forcefully exiting...');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    clearTimeout(shutdownTimeout);
    logger.info('Closing MongoDB connection...');
    
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      logger.info('Server shut down gracefully.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
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
  logger.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;