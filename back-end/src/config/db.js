const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
    // Sync models (disable force:true in production)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };