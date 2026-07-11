const { Question } = require("../models");

// ======================================
// Create Question
// POST /api/admin/questions
// ======================================

exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({
      ...req.body,
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// ======================================
// Update Question
// PATCH /api/admin/questions/:id
// ======================================

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    await question.update(req.body);

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// ======================================
// Delete Question
// DELETE /api/admin/questions/:id
// ======================================

exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    await question.destroy();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
