/**
 * Server Configuration
 * @module server
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const mongoose = require('mongoose');
const setupGracefulShutdown = require("./src/utils/gracefulshutdown");

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

// ==================== INITIALIZE & START APPLICATION ====================

const initializeServer = async () => {
  const server = await startServer();
setupGracefulShutdown(server);

};

// ==================== START APPLICATION ====================
initializeServer().catch((err) => {
  console.error(`Application startup failed: ${err.message}`);
  process.exit(1);
});

module.exports = app;