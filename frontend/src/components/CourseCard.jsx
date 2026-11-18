import React from 'react';
import { Clock, BookOpen, Star, UserCheck, Play, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course, enrollment, onEnroll, onContinue, isEnrolling }) => {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 dark:bg-slate-900/90 text-brand-600 dark:text-brand-400 backdrop-blur-md shadow-sm">
            {course.category}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 text-white backdrop-blur-md">
            {course.level}
          </span>
        </div>

        {isEnrolled && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Enrolled</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Lessons */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{course.rating || 4.9}</span>
              <span>({course.enrolledCount?.toLocaleString() || 1200})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration || '15h'}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.totalLessons || 20} lessons
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Bottom Section: Progress or Price & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {isEnrolled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Course Progress</span>
                <span className="text-brand-600 dark:text-brand-400">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                onClick={() => onContinue && onContinue(course._id, progress)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-200"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Tuition
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {course.price ? `$${course.price}` : 'Free'}
                </span>
              </div>

              <button
                onClick={() => onEnroll && onEnroll(course._id)}
                disabled={isEnrolling}
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

