const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getIsConnected } = require('../config/db');
const { MemoryUser } = require('../config/memoryDb');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: 'Student & Lifelong Learner',
      maxlength: [100, 'Headline cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      default: 'Learning modern web development and software engineering at EduHub.',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Tashkent, Uzbekistan',
    },
    enrolledCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        lastAccessedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: true,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// Hybrid model proxy that seamlessly delegates between Real MongoDB and Memory Engine
const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (!getIsConnected()) {
      if (prop in MemoryUser) {
        return MemoryUser[prop];
      }
    }
    return target[prop];
  },
});

module.exports = UserProxy;
