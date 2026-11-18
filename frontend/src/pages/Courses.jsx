import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import { CourseCard } from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const Courses = () => {
  const { user, isAuthenticated, refreshUser, addToast } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);

  const categories = [
    'All',
    'Web Development',
    'DevOps',
    'Data Science',
    'Design',
    'Cybersecurity',
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel !== 'All') params.level = selectedLevel;

      const data = await courseService.getCourses(params);
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      addToast('Failed to load courses from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      addToast('Please sign in or create an account to enroll in courses.', 'info');
      navigate('/login');
      return;
    }

    try {
      setEnrollingId(courseId);
      const result = await courseService.enrollCourse(courseId);
      if (result.success) {
        addToast(result.message, 'success', 'Enrolled');
        await refreshUser();
        // re-fetch to update enrolled counts
        await fetchCourses();
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || 'Could not enroll in course. Try again.',
        'error'
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const handleContinue = async (courseId, currentProgress) => {
    try {
      const nextProgress = Math.min(100, (currentProgress || 0) + 20);
      await courseService.updateProgress(courseId, nextProgress);
      addToast(
        nextProgress === 100
          ? '🎉 Fantastic! You completed all lessons in this course!'
          : `Progress updated to ${nextProgress}%!`,
        'success',
        'Study Progress'
      );
      await refreshUser();
    } catch (err) {
      addToast('Failed to update progress.', 'error');
    }
  };

  // Filter courses by search query client-side for instant snappy response
  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.instructor?.name?.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-200/80 dark:border-brand-800">
          <GraduationCap className="w-4 h-4" />
          <span>EduHub Comprehensive Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Industry-Leading Tech Courses
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          From hands-on full-stack development to cloud architecture and secure authentication.
          Choose your next skill and learn at your own pace.
        </p>
      </div>

      {/* Controls: Search & Category Pills */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, instructor, keywords (e.g. React, MERN, Docker)..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <LoadingSpinner message="Loading courses..." />
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredCourses.map((course) => {
            // Check if user is enrolled
            const enrollment = user?.enrolledCourses?.find(
              (item) =>
                item.course &&
                (item.course._id || item.course).toString() === course._id.toString()
            );

            return (
              <CourseCard
                key={course._id}
                course={course}
                enrollment={enrollment}
                onEnroll={handleEnroll}
                onContinue={handleContinue}
                isEnrolling={enrollingId === course._id}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No courses matched your search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your category filter or clearing the search terms.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedLevel('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

