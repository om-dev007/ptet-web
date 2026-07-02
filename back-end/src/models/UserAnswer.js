const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserAnswer = sequelize.define(
    "UserAnswer",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      attempt_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "test_attempts",
          key: "id",
        },
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
      },
      answer: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      time_taken_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "user_answers",
      timestamps: false,
    }
  );

  return UserAnswer;
};
