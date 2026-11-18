import React from 'react';
import { CheckCircle2, Award, BookOpen, User, Bell } from 'lucide-react';

export const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'certificate_earned':
        return {
          icon: Award,
          style: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        };
      case 'course_enrolled':
        return {
          icon: BookOpen,
          style: 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800',
        };
      case 'profile_updated':
        return {
          icon: User,
          style: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        };
      default:
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
    }
  };

  const { icon: Icon, style } = getIcon();

  const formattedDate = activity.createdAt
    ? new Date(activity.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <div className="flex items-start gap-3.5 py-3.5 group">
      <div className={`p-2 rounded-xl border flex-shrink-0 ${style}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {activity.title}
          </p>
          <span className="text-[10px] text-slate-400 flex-shrink-0">{formattedDate}</span>
        </div>
        {activity.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
};

