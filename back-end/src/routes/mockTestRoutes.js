const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const {validateGetTests} = require("../middleware/validators/mockTest.validator")

router.get('/', validateGetTests ,mockTestController.getTests);
router.get('/:id', mockTestController.getTestById);

module.exports = router;
