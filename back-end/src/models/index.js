const { sequelize } = require('../config/db');

const User = require('./User')(sequelize);
const UserProfile = require('./UserProfile')(sequelize);
const StudyMaterial = require('./StudyMaterial')(sequelize);
const SavedMaterial = require('./SavedMaterial')(sequelize);
const Tip = require('./Tip')(sequelize);


// Define associations if necessary
// User.hasOne(UserProfile, { foreignKey: 'user_id' });
// UserProfile.belongsTo(User, { foreignKey: 'user_id' });

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

module.exports = {
  sequelize,
  User,
  UserProfile,
  StudyMaterial,
  SavedMaterial,
  Tip,
};