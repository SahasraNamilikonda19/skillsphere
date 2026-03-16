const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    session: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Session',
      required: true
    },
    sender: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    content: {
      type:     String,
      required: [true, 'Message cannot be empty'],
      trim:     true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    isRead: {
      type:    Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);