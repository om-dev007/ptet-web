const { MockTest, Question } = require('../models');

exports.getTests = async (req, res, next) => {
  try {
    const { type, difficulty, duration } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (duration) filter.duration_minutes = duration;

    const tests = await MockTest.findAll({
      where: filter,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await MockTest.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          through: { attributes: [] },
        },
      ],
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found',
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};
