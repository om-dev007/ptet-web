const { TestAttempt } = require('../models'); // exist after Phase 4

/**
 * Get the top N weakest skills for a user based on average scores.
 * @param {string} userId - UUID of the user
 * @param {number} [limit=3] - Number of weakest skills to return
 * @returns {Promise<string[]>} Array of skill names (e.g. ['speaking', 'writing'])
 */
const getWeakSkills = async (userId, limit = 3) => {
  // Fetch all completed test attempts for this user
  const attempts = await TestAttempt.findAll({
    where: { user_id: userId, status: 'completed' },
    attributes: ['score_breakdown'], // JSONB with skill-wise scores
  });

  if (!attempts.length) {
    return []; // No data → no weak areas
  }

  // Aggregate scores per skill
  const skillScores = {
    speaking: [],
    writing: [],
    reading: [],
    listening: [],
  };

  attempts.forEach((attempt) => {
    const breakdown = attempt.score_breakdown || {};
    Object.keys(breakdown).forEach((skill) => {
      if (skillScores[skill] && typeof breakdown[skill] === 'number') {
        skillScores[skill].push(breakdown[skill]);
      }
    });
  });

  // Compute average for each skill
  const averages = {};
  Object.entries(skillScores).forEach(([skill, scores]) => {
    if (scores.length) {
      averages[skill] = scores.reduce((a, b) => a + b, 0) / scores.length;
    } else {
      averages[skill] = null;
    }
  });

  // Sort by average ascending (weakest first) and take top N
  const sortedSkills = Object.entries(averages)
    .filter(([_, avg]) => avg !== null)
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);

  return sortedSkills.slice(0, limit);
};

module.exports = { getWeakSkills };