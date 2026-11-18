const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { MemoryCourse } = require('../config/memoryDb');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      role: { type: String, default: 'Lead Instructor' },
    },
    category: {
      type: String,
      required: true,
      enum: ['Web Development', 'Data Science', 'Design', 'Mobile Development', 'DevOps', 'Cybersecurity'],
      default: 'Web Development',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '12h 30m',
    },
    totalLessons: {
      type: Number,
      default: 24,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    enrolledCount: {
      type: Number,
      default: 1250,
    },
    price: {
      type: Number,
      default: 0,
    },
    syllabus: [
      {
        module: String,
        lessons: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MongooseCourse = mongoose.models.Course || mongoose.model('Course', courseSchema);

const CourseProxy = new Proxy(MongooseCourse, {
  get(target, prop) {
    if (!getIsConnected()) {
      if (prop in MemoryCourse) {
        return MemoryCourse[prop];
      }
    }
    return target[prop];
  },
});

module.exports = CourseProxy;
