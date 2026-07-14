/**
 * Server Configuration
 * @module server
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const mongoose = require('mongoose');
const logger = require("./src/utils/serverLogger");
const healthRoutes = require('./src/routes/healthRoutes');
const setupGracefulShutdown = require('./src/utils/gracefulShutdown'); // 🔥 Fixed: Added missing import
const { streakJob } = require('./src/jobs/streakJob');
const validateEnv = require("./src/config/validateEnv");

const PORT = process.env.PORT || 5000;

require('./src/models');

// ==================== ENVIRONMENT VALIDATION ====================
validateEnv();

// ==================== UNHANDLED REJECTIONS & EXCEPTIONS ====================
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

// ==================== ROUTES ====================
app.use('/health', healthRoutes);

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      streakJob.start();
      logger.info('Cron jobs started');
    });

    return server;
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// ==================== INITIALIZE SERVER ====================
const initializeServer = async () => {
  const server = await startServer();
  // 🔥 Fixed: Using the imported helper (Issue #243)
  setupGracefulShutdown(server);
};

// ==================== START APPLICATION ====================
initializeServer().catch((err) => {
  logger.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;