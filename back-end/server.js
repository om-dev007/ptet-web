/**
 * Server Configuration
 * @module server
 */

require('dotenv').config();
const os = require('os');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const mongoose = require('mongoose');
const logger = require("./src/utils/serverLogger");


const PORT = process.env.PORT || 5000;

require('./src/models');

const { streakJob } = require('./src/jobs/streakJob');

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    streakJob.start();
    console.log('Cron jobs started');
// ==================== ENVIRONMENT VALIDATION ====================
const validateEnv = require("./src/config/validateEnv");
validateEnv();



const serverStartTime = Date.now();
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
app.get('/health', async (req, res) => {
  const memoryUsage = process.memoryUsage();

  // MongoDB Status Check
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
    connected: dbState === 1,
  };

  // Determine overall app status
  let appStatus = 'healthy';
  let dbLatency = null;

  // Lightweight DB Ping to calculate latency
  if (dbStatus.connected) {
    const startPing = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      dbLatency = Date.now() - startPing;
    } catch (err) {
      appStatus = 'degraded';
      dbLatency = 'error';
    }
  } else {
    appStatus = 'unhealthy';
  }

  return res.status(appStatus === 'unhealthy' ? 503 : 200).json({
    status: appStatus === 'healthy' ? 'OK' : appStatus === 'degraded' ? 'DEGRADED' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    application: {
      name: packageJson.name || 'Express App',
      version: packageJson.version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      startTime: new Date(serverStartTime).toISOString(),
      uptime: process.uptime(),
      processId: process.pid,
      nodeVersion: process.version,
    },
    system: {
      memory: {
        rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB',
      },
      platform: os.platform(),
      arch: os.arch(),
    },
    dependencies: {
      database: {
        type: 'MongoDB',
        status: dbStatus.state,
        connected: dbStatus.connected,
        latency: dbLatency !== null && typeof dbLatency === 'number' ? `${dbLatency}ms` : 'N/A',
      },
    },
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
setupGracefulShutdown(server);

};

// ==================== START APPLICATION ====================
initializeServer().catch((err) => {
  logger.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;