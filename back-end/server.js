require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

require('./src/models');

const { streakJob } = require('./src/jobs/streakJob');

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    streakJob.start();
    console.log('Cron jobs started');
  });
});
