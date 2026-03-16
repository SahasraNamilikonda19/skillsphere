const express = require('express');
const router  = express.Router();
const {
  getUserProfile,
  updateProfile,
  addSkillToTeach,
  addSkillToLearn,
  removeSkillToTeach,
  searchUsers,
  endorseUser,
  getLeaderboard
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/search',                protect, searchUsers);
router.get('/leaderboard',           protect, getLeaderboard);
router.get('/:id',                   protect, getUserProfile);
router.put('/:id',                   protect, updateProfile);
router.post('/:id/skills/teach',     protect, addSkillToTeach);
router.post('/:id/skills/learn',     protect, addSkillToLearn);
router.delete('/skills/teach/:skillId', protect, removeSkillToTeach);
router.post('/:id/endorse',          protect, endorseUser);

module.exports = router;