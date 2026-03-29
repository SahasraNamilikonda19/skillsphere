const express           = require('express');
const router            = express.Router();
const { protect }       = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

router.post('/',             protect, sessionController.requestSession);
router.get('/',              protect, sessionController.getMySessions);
router.get('/:id',           protect, sessionController.getSessionById);
router.put('/:id/accept',    protect, sessionController.acceptSession);
router.put('/:id/reject',    protect, sessionController.rejectSession);
router.put('/:id/complete',  protect, sessionController.completeSession);
router.put('/:id/feedback',  protect, sessionController.addFeedback);

module.exports = router;