const { User, MockTest, TestAttempt } = require("../models");
const { Op, fn, col } = require("sequelize");

exports.getAnalytics = async (req, res, next) => {
  try {
    // Total Users
    const totalUsers = await User.count();

    // Active Users
    const activeUsers = await User.count({
      where: {
        isActive: true,
      },
    });

    // Admin Count
    const adminUsers = await User.count({
      where: {
        role: "admin",
      },
    });

    // Mock Tests
    const totalTests = await MockTest.count();

    // Today's Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tests Taken Today
    const testsTakenToday = await TestAttempt.count({
      where: {
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    // Average Score
    const averageScore = await TestAttempt.findOne({
      attributes: [
        [
          fn("AVG", col("score")),
          "averageScore",
        ],
      ],
      raw: true,
    });

    // Daily Active Users
    const dau = await TestAttempt.count({
      distinct: true,
      col: "user_id",
      where: {
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    res.status(200).json({
      success: true,

      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalTests,
        dailyActiveUsers: dau,
        testsTakenToday,
        averageScore:
          Number(
            averageScore.averageScore || 0
          ).toFixed(2),
        revenue: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
