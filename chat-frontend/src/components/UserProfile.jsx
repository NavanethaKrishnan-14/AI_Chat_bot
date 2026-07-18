import React from 'react';

export const UserProfile = ({ user, onLogout }) => {
  // Generate initials from the user's name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AI';

  return (
    <div className="flex items-center justify-between px-3.5 py-3 bg-black border-t border-white/5 select-none">

      {/* User Info */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Avatar with initials */}
        <div className="relative flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs shadow-sm border border-white/20">
          {initials}
          {/* Online Status Dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
        </div>

        {/* Name + Email */}
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-slate-100 truncate leading-tight">
            {user?.name || 'AI User'}
          </h4>
          <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5 leading-none">
            {user?.email || ''}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        title="Sign out"
        className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

    </div>
  );
};
