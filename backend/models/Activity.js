const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { MemoryActivity } = require('../config/memoryDb');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lesson_completed', 'quiz_submitted', 'course_enrolled', 'certificate_earned', 'profile_updated'],
      default: 'lesson_completed',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      courseTitle: String,
      lessonTitle: String,
      score: Number,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseActivity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

const ActivityProxy = new Proxy(MongooseActivity, {
  get(target, prop) {
    if (!getIsConnected()) {
      if (prop in MemoryActivity) {
        return MemoryActivity[prop];
      }
    }
    return target[prop];
  },
});

module.exports = ActivityProxy;
