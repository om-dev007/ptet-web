const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SavedMaterial = sequelize.define(
    "SavedMaterial",
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      material_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      saved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: "saved_materials",
      timestamps: false, // we use saved_at instead of createdAt
    }
  );

  return SavedMaterial;
};