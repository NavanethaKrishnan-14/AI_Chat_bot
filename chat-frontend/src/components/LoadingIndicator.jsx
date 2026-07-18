import React from 'react';

export const LoadingIndicator = () => {
  return (
    <div className="flex items-start space-x-4 max-w-3xl w-full mx-auto px-4 md:px-6 py-4 animate-fade-in">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 font-bold text-[13px] shadow-sm select-none border border-slate-200/10 dark:border-slate-800">
        AI
      </div>
      
      {/* Typing Bubble */}
      <div className="flex flex-col space-y-1.5 max-w-[85%]">
        <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center space-x-1.5 h-10 w-[64px] justify-center">
          <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
