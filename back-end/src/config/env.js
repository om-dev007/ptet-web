const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of requiredEnvVars) {
  if (!process.env[key] || !process.env[key].trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};