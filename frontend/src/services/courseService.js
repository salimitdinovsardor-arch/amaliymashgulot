import api from './api';

export const courseService = {
  // Get all courses with optional filters
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get single course by ID
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Enroll in a course
  enrollCourse: async (id) => {
    const response = await api.post(`/courses/${id}/enroll`);
    return response.data;
  },

  // Update progress in course
  updateProgress: async (id, progress) => {
    const response = await api.put(`/courses/${id}/progress`, { progress });
    return response.data;
  },

  // Get dashboard metrics and activities
  getDashboardStats: async () => {
    const response = await api.get('/courses/stats/dashboard');
    return response.data;
  },
};

