import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, message = 'Loading EduHub...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 dark:border-brand-950 border-t-brand-600 animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      {message && (
        <span className="text-sm text-slate-500 dark:text-slate-400">{message}</span>
      )}
    </div>
  );
};

