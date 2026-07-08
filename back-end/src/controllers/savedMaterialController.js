const { SavedMaterial, StudyMaterial } = require('../models');
const response = require('../utils/response');

exports.toggleSave = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const materialId = req.params.materialId ? Number(req.params.materialId) : undefined;

    if (Number(req.user.id) !== userId && req.user.role !== 'admin') {
      return response.error(res, 'Unauthorized to modify saved materials for this user', 403);
    }

    const material = await StudyMaterial.findByPk(materialId);
    if (!material) {
      return response.error(res, 'Material not found', 404);
    }

    const existing = await SavedMaterial.findOne({
      where: { user_id: userId, material_id: materialId },
    });

    if (existing) {
      await existing.destroy();
      return response.success(res, null, 'Material unsaved (removed from bookmarks)');
    }

    await SavedMaterial.create({ user_id: userId, material_id: materialId });
    return response.success(res, null, 'Material saved (added to bookmarks)');
  } catch (err) {
    next(err);
  }
};

exports.getSavedMaterials = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    
    if (Number(req.user.id) !== userId && req.user.role !== 'admin') {
      return response.error(res, 'Unauthorized to view saved materials for this user', 403);
    }

    const savedRecords = await SavedMaterial.findAll({
      where: { user_id: userId },
      include: [
        {
          model: StudyMaterial,
          attributes: [
            'id',
            'title',
            'description',
            'type',
            'skill',
            'content_url',
            'is_premium',
            'created_at',
          ],
        },
      ],
      order: [['saved_at', 'DESC']],
    });

    const materials = savedRecords.map((record) => record.StudyMaterial);

    return response.success(res, materials, 'Saved materials retrieved');
  } catch (err) {
    next(err);
  }
};