const User = require('../models/User');

// @route  GET /api/users/:id
// @access Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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

// @route  PUT /api/users/:id
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    // Only allow user to update their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { name, bio, avatarUrl, availability } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, avatarUrl, availability },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/users/:id/skills/teach
// @access Private
const addSkillToTeach = async (req, res, next) => {
  try {
    const { name, level, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { skillsToTeach: { name, level, description } } },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/users/:id/skills/learn
// @access Private
const addSkillToLearn = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { skillsToLearn: { name } } },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/users/skills/teach/:skillId
// @access Private
const removeSkillToTeach = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { skillsToTeach: { _id: req.params.skillId } } },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users/search?skill=python
// @access Private
const searchUsers = async (req, res, next) => {
  try {
    const { skill, page = 1, limit = 10 } = req.query;

    let query = { isActive: true, _id: { $ne: req.user._id } };

    // Filter by skill if provided
    if (skill) {
      query['skillsToTeach.name'] = {
        $regex: skill,
        $options: 'i' // case insensitive
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ points: -1 }) // highest points first
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/users/:id/endorse
// @access Private
const endorseUser = async (req, res, next) => {
  try {
    // Can't endorse yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot endorse yourself'
      });
    }

    // Add 10 points to endorsed user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { points: 10 },
        $push: {
          badges: {
            name:     'Endorsed',
            icon:     '⭐',
            earnedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User endorsed successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users/leaderboard
// @access Private
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name avatarUrl points badges skillsToTeach')
      .sort({ points: -1 })
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  addSkillToTeach,
  addSkillToLearn,
  removeSkillToTeach,
  searchUsers,
  endorseUser,
  getLeaderboard
};