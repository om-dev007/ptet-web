// src/utils/gracefulShutdown.js
const mongoose = require('mongoose');

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

// एक्सपोर्ट फंक्शन जो सिग्नल्स को अटैच करता है
const setupGracefulShutdown = (server) => {
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, () => {
      gracefulShutdown(server, signal);
    });
  });
};

module.exports = setupGracefulShutdown;