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
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false
    },
    bio: {
      type:      String,
      default:   '',
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
    badges:       [badgeSchema],
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
    },
    resetPasswordToken: {
      type:    String,
      default: undefined
    },
    resetPasswordExpire: {
      type:    Date,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

// ✅ IMPORTANT: must be regular function, NOT arrow function
// Replace your existing userSchema.pre('save'...) with this:
// Replace your commented out block with this:
// REPLACE your current pre-save block with this:
userSchema.pre('save', async function() {
  // If password isn't modified, just exit the function
  if (!this.isModified('password')) {
    return; 
  }

  try {
    console.log("Attempting to hash password...");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("✅ Password hashed successfully!");
  } catch (error) {
    console.error("❌ Hashing Error:", error.message);
    throw error; // This tells Mongoose an error occurred
  }
});
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);