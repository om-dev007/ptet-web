const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Question = sequelize.define(
    "Question",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("speaking", "writing", "reading", "listening"),
        allowNull: false,
      },
      subtype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      content: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      audio_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      correct_answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      scoring_rubric: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: "questions",
      timestamps: false,
    }
  );

  return Question;
};
