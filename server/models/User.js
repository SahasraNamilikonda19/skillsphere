const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  description: { type: String, default: '' }
});

const badgeSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  icon:     { type: String, default: '🏆' },
  earnedAt: { type: Date, default: Date.now }
});

const availabilitySchema = new mongoose.Schema({
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  startTime: { type: String },
  endTime:   { type: String }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false // never returned in queries by default
    },
    bio: {
      type:    String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    avatarUrl: {
      type:    String,
      default: ''
    },
    skillsToTeach: [skillSchema],
    skillsToLearn: [{ name: { type: String, required: true } }],
    availability:  [availabilitySchema],
    points: {
      type:    Number,
      default: 0
    },
    badges:  [badgeSchema],
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5
    },
    totalRatings: {
      type:    Number,
      default: 0
    },
    isActive: {
      type:    Boolean,
      default: true
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password was changed
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);