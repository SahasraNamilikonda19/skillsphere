const Quiz    = require('../models/Quiz');
const Session = require('../models/Session');
const User    = require('../models/User');

// @route  POST /api/quiz/create
// @access Private (instructor only)
const createQuiz = async (req, res, next) => {
  try {
    const { sessionId, questions, passingScore } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the instructor can create a quiz' });
    }

    const quiz = await Quiz.create({
      session:      sessionId,
      createdBy:    req.user._id,
      skill:        session.skill,
      questions,
      passingScore: passingScore || 70
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quiz/session/:sessionId
// @access Private
const getQuizBySession = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ session: req.params.sessionId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this session' });
    }

    // Hide correct answers when sending to learner
    const quizData = {
      _id:          quiz._id,
      skill:        quiz.skill,
      passingScore: quiz.passingScore,
      questions:    quiz.questions.map(q => ({
        _id:      q._id,
        question: q.question,
        options:  q.options
        // correctAnswer is NOT sent to frontend
      }))
    };

    res.json({ success: true, quiz: quizData });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/quiz/:id/submit
// @access Private (learner only)
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of chosen indexes
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correct++;
    });

    const score  = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save submission
    quiz.submissions.push({
      user:    req.user._id,
      answers,
      score,
      passed
    });
    await quiz.save();

    // Update session quiz status
    await Session.findByIdAndUpdate(quiz.session, {
      quizCompleted: true,
      quizPassed:    passed
    });

    // Award badge and points if passed
    if (passed) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: 25 },
        $push: {
          badges: {
            name:     `${quiz.skill} Quiz Passed`,
            icon:     '🎓',
            earnedAt: new Date()
          }
        }
      });
    }

    res.json({
      success: true,
      score,
      passed,
      correct,
      total:   quiz.questions.length,
      message: passed
        ? `Congratulations! You passed with ${score}% and earned a badge!`
        : `You scored ${score}%. You need ${quiz.passingScore}% to pass. Keep practicing!`
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quiz/badges/:userId
// @access Private
const getUserBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('badges points name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, badges: user.badges, points: user.points });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuiz, getQuizBySession, submitQuiz, getUserBadges };