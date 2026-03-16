const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type:     String,
    required: true
  },
  options: {
    type:     [String],
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message:   'Each question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type:     Number, // index of correct option (0, 1, 2, or 3)
    required: true,
    min:      0,
    max:      3
  }
});

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  answers:     [Number], // array of chosen option indexes
  score:       Number,   // percentage score
  passed:      Boolean,
  submittedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema(
  {
    session: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Session',
      required: true
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    skill: {
      type:     String,
      required: true
    },
    questions:   [questionSchema],
    submissions: [submissionSchema],
    passingScore: {
      type:    Number,
      default: 70 // 70% to pass
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quiz', quizSchema);