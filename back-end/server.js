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
const { generateHealthStatus }  = require("./src/services/healthService");
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
  const healthData = await generateHealthStatus(serverStartTime);
  const statusCode = healthData.status === 'UNHEALTHY' ? 503 : 200;
  return res.status(statusCode).json(healthData);
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