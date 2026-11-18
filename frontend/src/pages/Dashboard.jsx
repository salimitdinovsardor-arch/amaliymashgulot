import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import { StatCard } from '../components/StatCard';
import { CourseCard } from '../components/CourseCard';
import { ActivityItem } from '../components/ActivityItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Flame,
  Calendar,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshUser, addToast } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    const fetchDashboardInfo = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          courseService.getDashboardStats(),
          courseService.getCourses(),
        ]);

        if (statsRes.success) {
          setDashboardData(statsRes);
        }
        if (coursesRes.success) {
          setAllCourses(coursesRes.courses);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardInfo();
  }, []);

  // Handler for continuing course & advancing progress interactively
  const handleContinueCourse = async (courseId, currentProgress) => {
    try {
      setIsUpdatingProgress(true);
      const nextProgress = Math.min(100, (currentProgress || 0) + 25);
      await courseService.updateProgress(courseId, nextProgress);

      addToast(
        nextProgress === 100
          ? '🎉 Congratulations! You completed this course and earned your certificate!'
          : `Progress updated to ${nextProgress}%! Keep up the great work!`,
        'success',
        'Study Session Complete'
      );

      // Refresh dashboard data and user state
      const updated = await courseService.getDashboardStats();
      if (updated.success) {
        setDashboardData(updated);
      }
      await refreshUser();
    } catch (err) {
      addToast('Failed to update course progress.', 'error');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Handler for enrolling in a new course from recommended section
  const handleEnroll = async (courseId) => {
    try {
      const res = await courseService.enrollCourse(courseId);
      if (res.success) {
        addToast(res.message, 'success', 'Course Enrolled');
        const updated = await courseService.getDashboardStats();
        if (updated.success) {
          setDashboardData(updated);
        }
        await refreshUser();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Enrollment failed', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your personalized learning metrics..." />;
  }

  const stats = dashboardData?.stats || {
    totalEnrolled: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0,
    studyHours: 4,
    certificatesEarned: 0,
  };

  const enrolledList = dashboardData?.enrolledCourses || [];
  const activities = dashboardData?.recentActivities || [];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>EduHub Student Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Scholar'}!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              You are currently on a <span className="font-bold text-white">4-day learning streak</span>. Maintain momentum with your software architecture studies today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-700 hover:bg-blue-50 shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Enrolled Courses"
          value={stats.totalEnrolled}
          change="+1 this week"
          changeType="positive"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressCourses}
          change="Active"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Certificates"
          value={stats.certificatesEarned}
          change="Verified"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Avg. Completion"
          value={`${stats.averageProgress}%`}
          change="Overall"
          icon={Clock}
          color="violet"
        />
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Courses (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                My Active Courses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continue right where you left off
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrolledList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledList.map((item) => {
                if (!item.course) return null;
                return (
                  <CourseCard
                    key={item.course._id}
                    course={item.course}
                    enrollment={item}
                    onContinue={handleContinueCourse}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No courses enrolled yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Browse our high-quality curriculum below and enroll in your first course with one click!
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Recommended Courses section if enrolled is low */}
          <div className="pt-4 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended For Your Learning Path
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allCourses
                .filter(
                  (c) =>
                    !enrolledList.some(
                      (e) => e.course && e.course._id.toString() === c._id.toString()
                    )
                )
                .slice(0, 2)
                .map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onEnroll={handleEnroll}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: User Profile snapshot, Learning Goals & Recent Activities (1 col) */}
        <div className="space-y-6">
          {/* Quick Profile Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-brand-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate">
                  {user?.headline || 'Full-Stack Developer'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.studyHours}h
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Study Hours
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedCourses}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Certificates
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Weekly Learning Goal */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Weekly Goal
              </span>
              <span className="text-xs font-bold text-brand-600">3 / 5 hrs</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Complete 2 more lessons to reach your weekly software engineering target!
            </p>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Recent Activity
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((act) => <ActivityItem key={act._id} activity={act} />)
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No activity recorded yet. Start studying a course to see your milestones here!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

