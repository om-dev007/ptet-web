// src/utils/processHandlers.js

const registerProcessHandlers = () => {
  // Unhandled Rejection Handler
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
  });

  // Uncaught Exception Handler
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
};

module.exports = registerProcessHandlers;