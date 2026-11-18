const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  enrollCourse,
  updateCourseProgress,
  getDashboardStats,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Public course browsing
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes (require JWT auth)
router.get('/stats/dashboard', protect, getDashboardStats);
router.post('/:id/enroll', protect, enrollCourse);
router.put('/:id/progress', protect, updateCourseProgress);

module.exports = router;

