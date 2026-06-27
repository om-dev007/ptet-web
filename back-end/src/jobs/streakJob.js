const cron = require('node-cron');
const { Op } = require('sequelize');
const { UserProfile, sequelize } = require('../models');
const redis = require('../config/redis');

const updateStreaks = async () => {
  try {
    console.log('🔄 Starting daily streak update job...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    await UserProfile.update(
      { streak_days: sequelize.literal('streak_days + 1') },
      {
        where: {
          last_active: {
            [Op.gte]: yesterday,
            [Op.lt]: today
          }
        }
      }
    );

    await UserProfile.update(
      { streak_days: 0 },
      {
        where: {
          last_active: {
            [Op.lt]: yesterday
          },
          streak_days: {
            [Op.gt]: 0
          }
        }
      }
    );
    const profiles = await UserProfile.findAll({
      attributes: ['user_id', 'streak_days']
    });

    if (profiles.length > 0) {
      const pipeline = redis.pipeline();
      profiles.forEach(profile => {
        pipeline.set(`user:${profile.user_id}:streak`, profile.streak_days);
      });
      await pipeline.exec();
    }

    console.log(`Streak update completed. Synced ${profiles.length} profiles to Redis.`);
  } catch (error) {
    console.error('Error updating streaks:', error);
  }
};

const streakJob = cron.schedule('0 0 * * *', updateStreaks, {
  scheduled: false,
  timezone: "UTC"
});

module.exports = {
  streakJob,
  updateStreaks
};
