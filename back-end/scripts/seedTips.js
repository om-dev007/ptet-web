// scripts/seedTips.js (run once)
const { Tip, sequelize } = require('../src/models');

const tips = [
  { content: "Practice speaking for at least 15 minutes every day to build fluency.", category: "Speaking" },
  { content: "Use the 'Read Aloud' technique to improve pronunciation and intonation.", category: "Speaking" },
  { content: "For writing tasks, always plan your essay structure before you start writing.", category: "Writing" },
  { content: "Read English newspapers daily to improve reading speed and comprehension.", category: "Reading" },
  { content: "Listen to podcasts in English with transcripts to enhance listening skills.", category: "Listening" },
  // ... add more
];

(async () => {
  await sequelize.sync();
  await Tip.bulkCreate(tips);
  console.log('✅ Tips seeded');
  process.exit();
})();