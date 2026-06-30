const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {                   // ✅ Email format check
            msg: "Must be a valid email address",
          },
          notEmpty: {                  // ✅ Prevents empty strings
            msg: "Email cannot be empty",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {                  // ✅ Prevents empty strings
            msg: "Name cannot be empty",
          },
          len: {                       // ✅ Length constraint (min:2, max:50)
            args: [2, 50],
            msg: "Name must be between 2 and 50 characters",
          },
        },
      },
      photo_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {                     // ✅ URL validation
            msg: "Please provide a valid URL for the photo",
          },
        },
      },
      provider: {
        type: DataTypes.ENUM("google", "github", "email"),
        allowNull: false,
        defaultValue: "email",
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // ✅ Data Sanitization Hooks
  User.beforeCreate((user) => {
    if (user.email) user.email = user.email.toLowerCase().trim(); // Normalize email
    if (user.name) user.name = user.name.trim();                  // Trim whitespace
  });

  User.beforeUpdate((user) => {
    if (user.email) user.email = user.email.toLowerCase().trim(); // Normalize email
    if (user.name) user.name = user.name.trim();                  // Trim whitespace
  });

  return User;
};