import React from 'react';

export const Header = ({
  sidebarOpen,
  onToggleSidebar,
  activeChatTitle,
  onClearChat,
  isOnline,
  onCreateNew
}) => {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md select-none flex-shrink-0 z-30">
      
      {/* Left side actions (Sidebar toggle and Title) */}
      <div className="flex items-center space-x-3.5 min-w-0">
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/80 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              /* Collapse layout icon */
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16" />
            ) : (
              /* Expand layout icon */
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Current Active Conversation Name */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate tracking-wide leading-tight">
            {activeChatTitle || 'AI Assistant'}
          </h1>
          
          {/* Status Subtitle */}
          <div className="flex items-center mt-0.5 space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight">
              {isOnline ? 'System Live' : 'Offline - Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right side actions (Quick Actions) */}
      <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
        
        {/* Mobile-only Quick New Chat Shortcut */}
        <button
          onClick={onCreateNew}
          title="New Chat"
          className="md:hidden p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Clear Chat Log */}
        <button
          onClick={onClearChat}
          title="Wipe conversation logs"
          className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

      </div>
    </header>
  );
};
