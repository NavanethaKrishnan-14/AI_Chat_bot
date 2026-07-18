import React from 'react';
import { ConversationList } from './ConversationList';
import { UserProfile } from './UserProfile';

export const Sidebar = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
  onCreateNew,
  searchQuery,
  onSearchChange,
  user,
  onLogout
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay - only visible when drawer is open on mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header section (New Chat button & Close Button for mobile) */}
        <div className="flex items-center justify-between p-3.5 select-none">
          {/* New Chat Button */}
          <button
            onClick={() => {
              onCreateNew();
              // Auto close on mobile after creating new chat
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            className="flex-1 flex items-center justify-center space-x-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-sm hover:shadow transition-all duration-200 cursor-pointer font-semibold text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Close Sidebar button for mobile drawer */}
          <button
            onClick={onClose}
            title="Close sidebar"
            className="md:hidden ml-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar section */}
        <div className="px-3.5 pb-2.5 select-none">
          <div className="relative flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-slate-400 dark:focus-within:border-slate-750 transition-colors">
            <div className="absolute left-3 text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border-none outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-0.5 rounded text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 flex flex-col min-h-0 bg-transparent border-t border-slate-200/50 dark:border-slate-900/60">
          <div className="px-3.5 pt-3.5 pb-1 select-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Chat History
            </span>
          </div>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              onSelect(id);
              // Auto close drawer on mobile screen width
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            onDelete={onDelete}
            onRename={onRename}
          />
        </div>

        {/* User Profile Section */}
        <UserProfile user={user} onLogout={onLogout} />
      </aside>
    </>
  );
};
