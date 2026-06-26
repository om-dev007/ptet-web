const express = require('express');
const router = express.Router();
const studyMaterialController = require('../controllers/studyMaterialController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/materials/recommended/:userId - needs authentication
router.get('/recommended/:userId', authenticate, studyMaterialController.getRecommendedMaterials);

// GET /api/materials - public listing
router.get('/', studyMaterialController.getMaterials);

// GET /api/materials/:id - public detail
router.get('/:id', studyMaterialController.getMaterialById);

module.exports = router;