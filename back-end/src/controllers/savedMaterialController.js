const { SavedMaterial, StudyMaterial } = require('../models');
const response = require('../utils/response');

/**
 * POST /api/users/:id/saved/:materialId
 * Toggle bookmark: add if not saved, remove if already saved.
 */
exports.toggleSave = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const materialId = req.params.materialId;

    // Authorization: only the user themselves or an admin can modify
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return response.error(res, 'Unauthorized to modify saved materials for this user', 403);
    }

    // Check if the material exists
    const material = await StudyMaterial.findByPk(materialId);
    if (!material) {
      return response.error(res, 'Material not found', 404);
    }

    // Check current bookmark status
    const existing = await SavedMaterial.findOne({
      where: { user_id: userId, material_id: materialId },
    });

    if (existing) {
      // Unsave
      await existing.destroy();
      return response.success(res, null, 'Material unsaved (removed from bookmarks)');
    } else {
      // Save
      await SavedMaterial.create({ user_id: userId, material_id: materialId });
      return response.success(res, null, 'Material saved (added to bookmarks)');
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id/saved
 * List all bookmarked materials for a user.
 */
exports.getSavedMaterials = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Authorization: only the user themselves or an admin can view
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return response.error(res, 'Unauthorized to view saved materials for this user', 403);
    }

    const savedRecords = await SavedMaterial.findAll({
      where: { user_id: userId },
      include: [
        {
          model: StudyMaterial,
          attributes: ['id', 'title', 'description', 'type', 'skill', 'content_url', 'is_premium', 'created_at'],
        },
      ],
      order: [['saved_at', 'DESC']],
    });

    // Extract the material objects from the join
    const materials = savedRecords.map((record) => record.StudyMaterial);

    return response.success(res, materials, 'Saved materials retrieved');
  } catch (err) {
    next(err);
  }
};