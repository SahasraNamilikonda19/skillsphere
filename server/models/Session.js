const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    learner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    instructor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    skill: {
      type:     String,
      required: [true, 'Skill is required'],
      trim:     true
    },
    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    scheduledAt: {
      type: Date
    },
    duration: {
      type:    Number, // in minutes
      default: 60
    },
    meetingLink: {
      type:    String,
      default: ''
    },
    message: {
      type:    String, // learner's initial message when requesting
      default: ''
    },
    feedback: {
      type:    String, // learner's feedback after session
      default: ''
    },
    rating: {
      type: Number,
      min:  1,
      max:  5
    },
    quizCompleted: {
      type:    Boolean,
      default: false
    },
    quizPassed: {
      type:    Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Session', sessionSchema);