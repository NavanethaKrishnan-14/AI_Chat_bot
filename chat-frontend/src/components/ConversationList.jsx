import React, { useState } from 'react';

export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (e, id, title) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-slate-400 dark:text-slate-500">
        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-xs font-medium">No results found</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-1.5 scrollbar-thin">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const isEditing = conv.id === editingId;

        return (
          <div
            key={conv.id}
            onClick={() => !isEditing && onSelect(conv.id)}
            className={`group relative flex items-center h-10 px-3 rounded-xl cursor-pointer transition-all duration-150 border ${
              isActive
                ? 'bg-slate-200/60 dark:bg-slate-800/50 border-slate-300/30 dark:border-slate-750 text-slate-900 dark:text-slate-100 font-semibold'
                : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Chat Icon */}
            <div className="flex-shrink-0 mr-2.5">
              <svg className={`w-4 h-4 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            {/* Title / Input */}
            <div className="flex-1 min-w-0 pr-12">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(conv.id)}
                  onKeyDown={(e) => handleKeyDown(e, conv.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs py-0.5 px-1.5 rounded border border-slate-400 dark:border-slate-600 outline-none font-sans"
                />
              ) : (
                <span className="block truncate text-xs select-none">
                  {conv.title}
                </span>
              )}
            </div>

            {/* Quick Actions (Rename & Delete) - visible on hover */}
            {!isEditing && (
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 bg-gradient-to-l from-slate-50 dark:from-slate-900 via-slate-50 dark:via-slate-900 to-transparent pl-3 h-8 rounded-r-xl transition-all duration-150">
                
                {/* Rename Button */}
                <button
                  onClick={(e) => startEditing(e, conv.id, conv.title)}
                  title="Rename chat"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete this chat: "${conv.title}"?`)) {
                      onDelete(conv.id);
                    }
                  }}
                  title="Delete chat"
                  className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
