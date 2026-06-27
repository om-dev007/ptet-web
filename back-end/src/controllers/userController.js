const { User, UserProfile } = require('../models');

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'verification_token'] },
      include: [
        {
          model: UserProfile,
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ where: { user_id: id } });

    const allowedFields = ['target_score', 'test_date', 'country_applying_to', 'visa_type', 'streak_days', 'last_active'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (!userProfile) {
      userProfile = await UserProfile.create({
        user_id: id,
        target_score: updateData.target_score || 0,
        ...updateData
      });
    } else {
      await userProfile.update(updateData);
    }

    res.status(200).json({ message: 'Profile updated successfully', userProfile });
  } catch (err) {
    next(err);
  }
};
