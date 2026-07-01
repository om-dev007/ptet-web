const { sequelize } = require('../config/db');

const User = require('./User')(sequelize);
const UserProfile = require('./UserProfile')(sequelize);
const StudyMaterial = require('./StudyMaterial')(sequelize);
const SavedMaterial = require('./SavedMaterial')(sequelize);
const Tip = require('./Tip')(sequelize);
const Question = require('./Question')(sequelize);
const MockTest = require('./MockTest')(sequelize);
const MockTestQuestion = require('./MockTestQuestion')(sequelize);
const TestAttempt = require('./TestAttempt')(sequelize);
const UserAnswer = require('./UserAnswer')(sequelize);


User.hasOne(UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });

// SavedMaterial belongs to User and StudyMaterial
SavedMaterial.belongsTo(User, { foreignKey: 'user_id' });
SavedMaterial.belongsTo(StudyMaterial, { foreignKey: 'material_id' });

// User has many SavedMaterials (for direct querying)
User.hasMany(SavedMaterial, { foreignKey: 'user_id' });
StudyMaterial.hasMany(SavedMaterial, { foreignKey: 'material_id' });

// Optional: Many-to-many through relationship for convenience
User.belongsToMany(StudyMaterial, {
  through: SavedMaterial,
  foreignKey: 'user_id',
  otherKey: 'material_id',
  as: 'bookmarkedMaterials',
});
StudyMaterial.belongsToMany(User, {
  through: SavedMaterial,
  foreignKey: 'material_id',
  otherKey: 'user_id',
});

MockTest.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(MockTest, { foreignKey: 'created_by' });

TestAttempt.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TestAttempt, { foreignKey: 'user_id' });

TestAttempt.belongsTo(MockTest, { foreignKey: 'test_id' });
MockTest.hasMany(TestAttempt, { foreignKey: 'test_id' });

UserAnswer.belongsTo(TestAttempt, { foreignKey: 'attempt_id' });
TestAttempt.hasMany(UserAnswer, { foreignKey: 'attempt_id' });

UserAnswer.belongsTo(Question, { foreignKey: 'question_id' });
Question.hasMany(UserAnswer, { foreignKey: 'question_id' });

MockTest.belongsToMany(Question, {
  through: MockTestQuestion,
  foreignKey: 'test_id',
  otherKey: 'question_id',
  as: 'questions',
});
Question.belongsToMany(MockTest, {
  through: MockTestQuestion,
  foreignKey: 'question_id',
  otherKey: 'test_id',
  as: 'mockTests',
});

module.exports = {
  sequelize,
  User,
  UserProfile,
  StudyMaterial,
  SavedMaterial,
  Tip,
  Question,
  MockTest,
  MockTestQuestion,
  TestAttempt,
  UserAnswer,
};