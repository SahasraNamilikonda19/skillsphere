const Session = require('../models/Session');
const User    = require('../models/User');

// @route  POST /api/sessions
// @access Private
const requestSession = async (req, res, next) => {
  try {
    const { instructorId, skill, scheduledAt, duration, message } = req.body;

    if (!instructorId || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Instructor and skill are required'
      });
    }

    // Can't book yourself
    if (instructorId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book a session with yourself'
      });
    }

    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Generate Jitsi meeting link
    const meetingLink = `https://meet.jit.si/skillsphere-${Date.now()}`;

    const session = await Session.create({
      learner:     req.user._id,
      instructor:  instructorId,
      skill,
      scheduledAt,
      duration:    duration || 60,
      message:     message || '',
      meetingLink
    });

    // Populate learner and instructor details
    await session.populate('learner instructor', 'name email avatarUrl');

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions
// @access Private
const getMySessions = async (req, res, next) => {
  try {
    const { status, role } = req.query;

    let query = {};

    // Filter by role
    if (role === 'learner') {
      query.learner = req.user._id;
    } else if (role === 'instructor') {
      query.instructor = req.user._id;
    } else {
      // Return all sessions where user is either learner or instructor
      query.$or = [
        { learner:    req.user._id },
        { instructor: req.user._id }
      ];
    }

    // Filter by status
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate('learner instructor', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/:id
// @access Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('learner instructor', 'name email avatarUrl skillsToTeach');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Only learner or instructor can view the session
    const isLearner    = session.learner._id.toString()    === req.user._id.toString();
    const isInstructor = session.instructor._id.toString() === req.user._id.toString();

    if (!isLearner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/sessions/:id/accept
// @access Private (instructor only)
const acceptSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the instructor can accept this session' });
    }

    session.status = 'accepted';
    await session.save();
    await session.populate('learner instructor', 'name email avatarUrl');

    res.json({ success: true, message: 'Session accepted', session });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/sessions/:id/reject
// @access Private (instructor only)
const rejectSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the instructor can reject this session' });
    }

    session.status = 'rejected';
    await session.save();

    res.json({ success: true, message: 'Session rejected', session });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/sessions/:id/complete
// @access Private (instructor only)
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the instructor can complete this session' });
    }

    session.status = 'completed';
    await session.save();

    // Award points to instructor (20 points for teaching)
    await User.findByIdAndUpdate(session.instructor, {
      $inc: { points: 20 },
      $push: {
        badges: { name: 'Teacher', icon: '👨‍🏫', earnedAt: new Date() }
      }
    });

    // Award points to learner (10 points for attending)
    await User.findByIdAndUpdate(session.learner, {
      $inc: { points: 10 },
      $push: {
        badges: { name: 'Learner', icon: '📚', earnedAt: new Date() }
      }
    });

    res.json({ success: true, message: 'Session completed! Points awarded.', session });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/sessions/:id/feedback
// @access Private (learner only)
const addFeedback = async (req, res, next) => {
  try {
    const { feedback, rating } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the learner can add feedback' });
    }

    session.feedback = feedback;
    session.rating   = rating;
    await session.save();

    // Update instructor's average rating
    if (rating) {
      const instructor = await User.findById(session.instructor);
      const newTotal   = instructor.totalRatings + 1;
      const newRating  = ((instructor.rating * instructor.totalRatings) + rating) / newTotal;

      await User.findByIdAndUpdate(session.instructor, {
        rating:       newRating,
        totalRatings: newTotal
      });
    }

    res.json({ success: true, message: 'Feedback added', session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestSession,
  getMySessions,
  getSessionById,
  acceptSession,
  rejectSession,
  completeSession,
  addFeedback
};