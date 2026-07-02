const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');

router.get('/', mockTestController.getTests);
router.get('/:id', mockTestController.getTestById);

module.exports = router;
