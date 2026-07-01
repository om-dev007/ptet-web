
const pino = require('pino');


const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: isDev ? 'debug' : 'info',
   
  timestamp: pino.stdTimeFunctions.isoTime, // ISO Timestamp (2026-07-01T10:00:00.000Z)
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }), 
  },
  transport: isDev
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
    : undefined, 
});

module.exports = logger;