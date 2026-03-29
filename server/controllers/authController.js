const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const User      = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route  POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    const user  = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        points:        user.points,
        badges:        user.badges,
        avatarUrl:     user.avatarUrl,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        points:        user.points,
        badges:        user.badges,
        avatarUrl:     user.avatarUrl,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and save to database
    user.resetPasswordToken   = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire  = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SkillSphere</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827;">Reset Your Password</h2>
          <p style="color: #6b7280;">Hi ${user.name},</p>
          <p style="color: #6b7280;">
            You requested to reset your password. Click the button below to set a new password.
            This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #4f46e5; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
            Your password will not change.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to:      user.email,
        subject: 'SkillSphere — Password Reset Request',
        html
      });

      res.json({
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.'
      });
    }

    // Set new password
    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        points:    user.points,
        badges:    user.badges,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};