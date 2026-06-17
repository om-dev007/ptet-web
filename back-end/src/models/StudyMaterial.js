const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudyMaterial = sequelize.define(
    "StudyMaterial",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      type: {
        type: DataTypes.ENUM("article", "video", "tip"),
        allowNull: false,
      },

      skill: {
        type: DataTypes.ENUM(
          "speaking",
          "writing",
          "reading",
          "listening"
        ),
        allowNull: false,
      },

      content_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      is_premium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: "study_materials",
      timestamps: false,
    }
  );

  return StudyMaterial;
};