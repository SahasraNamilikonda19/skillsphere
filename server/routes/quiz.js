const express        = require('express');
const router         = express.Router();
const { protect }    = require('../middleware/auth');
const quizController = require('../controllers/quizController');

router.post('/create',            protect, quizController.createQuiz);
router.get('/session/:sessionId', protect, quizController.getQuizBySession);
router.get('/badges/:userId',     protect, quizController.getUserBadges);
router.get('/:id',                protect, quizController.getQuizById);
router.post('/:id/submit',        protect, quizController.submitQuiz);

module.exports = router;