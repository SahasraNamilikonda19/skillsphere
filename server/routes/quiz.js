const express = require('express');
const router  = express.Router();
const {
  createQuiz,
  getQuizBySession,
  submitQuiz,
  getUserBadges
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.post('/create',                protect, createQuiz);
router.get('/session/:sessionId',     protect, getQuizBySession);
router.post('/:id/submit',            protect, submitQuiz);
router.get('/badges/:userId',         protect, getUserBadges);

module.exports = router;