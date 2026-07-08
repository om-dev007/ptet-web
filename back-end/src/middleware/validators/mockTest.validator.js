const { query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const ALLOWED_TEST_TYPES = ['subject', 'chapter', 'full-length'];
const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];

exports.validateGetTests = [
  query('type')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(ALLOWED_TEST_TYPES)
    .withMessage(
      `type must be one of: ${ALLOWED_TEST_TYPES.join(', ')}`
    ),

  query('difficulty')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(ALLOWED_DIFFICULTIES)
    .withMessage(
      `difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(', ')}`
    ),

  query('duration')
    .optional()
    .trim()
    .isInt({ min: 1 })
    .withMessage('duration must be a positive integer')
    .toInt(),

  handleValidationErrors,
];