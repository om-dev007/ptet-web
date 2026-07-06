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
const packageJson = require('./package.json'); // 🟢 Fixed: Added missing import
const setupGracefulShutdown = require('./src/utils/gracefulShutdown'); // 🟢 Fixed: Added import for #243
const PORT = process.env.PORT || 5000;

require('./src/models');

const { streakJob } = require('./src/jobs/streakJob');

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

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/health', async (req, res) => {
  const memoryUsage = process.memoryUsage();

  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
    connected: dbState === 1,
  };

  let appStatus = 'healthy';
  let dbLatency = null;

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
      streakJob.start(); // Cron job starts here
      logger.info('Cron jobs started');
    });

    return server;
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};


// ==================== INITIALIZE SERVER ====================
// 🟢 Fixed: Removed unused 'serverInstance' variable and added the imported helper
const initializeServer = async () => {
  const server = await startServer();
  setupGracefulShutdown(server); // ✅ Duplicate code removed
};

// ==================== START APPLICATION ====================
initializeServer().catch((err) => {
  logger.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;