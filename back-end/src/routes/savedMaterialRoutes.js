const express = require('express');
const router = express.Router({ mergeParams: true });
const savedMaterialController = require('../controllers/savedMaterialController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// POST /api/users/:id/saved/:materialId
router.post('/:materialId', savedMaterialController.toggleSave);

// GET /api/users/:id/saved
router.get('/', savedMaterialController.getSavedMaterials);

module.exports = router;