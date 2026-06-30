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

exports.getDashboardData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check authorization
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this dashboard' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = await UserProfile.findOne({ where: { user_id: id } });
    const streak = userProfile ? userProfile.streak_days : 0;

    // TODO: Fetch from actual models (TestResults, Attempts, etc.) once they are implemented
    const dashboardData = {
      streak,
      tests_taken: 12, // Mocked
      average_score: 68, // Mocked
      weak_skills: ['Reading Comprehension', 'Speaking Part 2'], // Mocked
      recent_activity: [ // Mocked
        { id: '1', action: 'completed_mock_test', score: 65, date: new Date().toISOString() },
        { id: '2', action: 'practiced_speaking', duration_minutes: 15, date: new Date(Date.now() - 86400000).toISOString() }
      ]
    };

    res.status(200).json(dashboardData);
  } catch (err) {
    next(err);
  }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;


    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this activity log' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const totalActivities = 45; 
    const actions = ['test_completed', 'test_started', 'study_material_viewed'];
    
    const activities = [];
    const startIndex = (page - 1) * limit;
    
    const end = Math.min(startIndex + limit, totalActivities);
    for (let i = startIndex; i < end; i++) {
      const action = actions[i % actions.length];
      const activity = {
        id: `act_${totalActivities - i}`,
        action: action,
        date: new Date(Date.now() - i * 3600000 * 5).toISOString(), 
      };
      
      if (action === 'test_completed') {
        activity.score = Math.floor(Math.random() * 40) + 50;
      } else if (action === 'test_started') {
        activity.test_id = `test_${i}`;
      }
      
      activities.push(activity);
    }

    res.status(200).json({
      data: activities,
      pagination: {
        page,
        limit,
        totalItems: totalActivities,
        totalPages: Math.ceil(totalActivities / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};
