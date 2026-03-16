const express = require('express');
const router  = express.Router();
const {
  requestSession,
  getMySessions,
  getSessionById,
  acceptSession,
  rejectSession,
  completeSession,
  addFeedback
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.post('/',                    protect, requestSession);
router.get('/',                     protect, getMySessions);
router.get('/:id',                  protect, getSessionById);
router.put('/:id/accept',           protect, acceptSession);
router.put('/:id/reject',           protect, rejectSession);
router.put('/:id/complete',         protect, completeSession);
router.put('/:id/feedback',         protect, addFeedback);

module.exports = router;