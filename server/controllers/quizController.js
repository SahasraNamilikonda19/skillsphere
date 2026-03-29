const Quiz    = require('../models/Quiz');
const Session = require('../models/Session');
const User    = require('../models/User');

// @route  POST /api/quiz/create
const createQuiz = async (req, res, next) => {
  try {
    const { sessionId, questions, passingScore } = req.body;

    if (!sessionId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and questions are required'
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only instructor can create quiz' });
    }

    // Check if quiz already exists for this session
    const existingQuiz = await Quiz.findOne({ session: sessionId });
    if (existingQuiz) {
      return res.status(400).json({ success: false, message: 'Quiz already exists for this session' });
    }

    const quiz = await Quiz.create({
      session:      sessionId,
      createdBy:    req.user._id,
      skill:        session.skill,
      questions,
      passingScore: passingScore || 70
    });

    // Update session to mark quiz as assigned
    await Session.findByIdAndUpdate(sessionId, { quizAssigned: true });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quiz/session/:sessionId
const getQuizBySession = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ session: req.params.sessionId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this session' });
    }

    // Check if user already submitted
    const submission = quiz.submissions.find(
      s => s.user.toString() === req.user._id.toString()
    );

    // Hide correct answers for learner who hasn't submitted yet
    const isInstructor = quiz.createdBy.toString() === req.user._id.toString();

    const questions = isInstructor || submission
      ? quiz.questions // show correct answers to instructor or after submission
      : quiz.questions.map(q => ({
          _id:      q._id,
          question: q.question,
          options:  q.options
          // correctAnswer hidden
        }));

    res.json({
      success: true,
      quiz: {
        _id:          quiz._id,
        skill:        quiz.skill,
        passingScore: quiz.passingScore,
        questions,
        submission:   submission || null,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/quiz/:id/submit
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if already submitted
    const alreadySubmitted = quiz.submissions.find(
      s => s.user.toString() === req.user._id.toString()
    );
    if (alreadySubmitted) {
      return res.status(400).json({ success: false, message: 'You already submitted this quiz' });
    }

    // Calculate score
    let correct = 0;
    const results = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question:      q.question,
        yourAnswer:    q.options[answers[index]],
        correctAnswer: q.options[q.correctAnswer],
        isCorrect
      };
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

    // Update session
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
      results,
      message: passed
        ? `Congratulations! You scored ${score}% and earned a badge!`
        : `You scored ${score}%. You need ${quiz.passingScore}% to pass. Try again!`
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quiz/:id
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quiz/badges/:userId
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

module.exports = {
  createQuiz,
  getQuizBySession,
  submitQuiz,
  getQuizById,
  getUserBadges
};