const express        = require('express');
const router         = express.Router();
const { protect }    = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/register',                    authController.register);
router.post('/login',                       authController.login);
router.get('/me',              protect,     authController.getMe);
router.post('/forgot-password',             authController.forgotPassword);
router.put('/reset-password/:token',        authController.resetPassword);

module.exports = router;