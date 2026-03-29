const express        = require('express');
const router         = express.Router();
const { protect }    = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/search',                protect, userController.searchUsers);
router.get('/leaderboard',           protect, userController.getLeaderboard);
router.get('/:id',                   protect, userController.getUserProfile);
router.put('/:id',                   protect, userController.updateProfile);
router.post('/:id/skills/teach',     protect, userController.addSkillToTeach);
router.post('/:id/skills/learn',     protect, userController.addSkillToLearn);
router.delete('/skills/teach/:skillId', protect, userController.removeSkillToTeach);
router.post('/:id/endorse',          protect, userController.endorseUser);

module.exports = router;