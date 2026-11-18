const Course = require('../models/Course');
const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * @route   GET /api/courses
 * @desc    Get all courses with optional category and search filters
 * @access  Public
 */
const getCourses = async (req, res, next) => {
  try {
    const { category, search, level } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course details
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll authenticated user in course
 * @access  Private
 */
const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      (item) => item.course && item.course.toString() === course._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    // Enroll with initial 5% progress
    user.enrolledCourses.push({
      course: course._id,
      progress: 5,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    });
    await user.save();

    // Increment enrolledCount
    course.enrolledCount += 1;
    await course.save();

    // Log Activity
    await Activity.create({
      user: user._id,
      type: 'course_enrolled',
      title: `Enrolled in ${course.title}`,
      description: `Began learning ${course.category} with ${course.instructor.name}.`,
      metadata: {
        courseId: course._id,
        courseTitle: course.title,
      },
    });

    res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.title}!`,
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/courses/:id/progress
 * @desc    Update learning progress for a course
 * @access  Private
 */
const updateCourseProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const courseId = req.params.id;

    const user = await User.findById(req.user._id);
    const enrollment = user.enrolledCourses.find(
      (item) => item.course && item.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course.',
      });
    }

    enrollment.progress = Math.min(100, Math.max(0, Number(progress)));
    enrollment.lastAccessedAt = new Date();
    await user.save();

    // If completed
    if (enrollment.progress === 100) {
      const course = await Course.findById(courseId);
      await Activity.create({
        user: user._id,
        type: 'certificate_earned',
        title: `Completed ${course ? course.title : 'Course'}!`,
        description: 'Earned official Certificate of Completion.',
        metadata: {
          courseId,
          courseTitle: course ? course.title : '',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course progress updated.',
      progress: enrollment.progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/courses/stats/dashboard
 * @desc    Get dashboard metrics and activities for current user
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses.course',
      model: 'Course',
    });

    const enrolled = user.enrolledCourses || [];
    const totalEnrolled = enrolled.length;
    const completedCourses = enrolled.filter((c) => c.progress >= 100).length;
    const inProgressCourses = enrolled.filter((c) => c.progress > 0 && c.progress < 100).length;

    const averageProgress =
      totalEnrolled > 0
        ? Math.round(enrolled.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled)
        : 0;

    // Get recent activities
    const activities = await Activity.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        averageProgress,
        studyHours: Math.round(totalEnrolled * 6.5 + 4),
        certificatesEarned: completedCourses,
      },
      enrolledCourses: enrolled,
      recentActivities: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  enrollCourse,
  updateCourseProgress,
  getDashboardStats,
};

