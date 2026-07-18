import React, { useRef, useEffect } from 'react';

export const MessageInput = ({ 
  input, 
  setInput, 
  onSubmit, 
  isLoading, 
  maxChars = 800 
}) => {
  const textareaRef = useRef(null);

  // Auto-resize the textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight
    textarea.style.height = 'auto';
    
    // Set to scrollHeight (capped by css max-h-52)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 208)}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    // Submit on Enter, allow Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value.slice(0, maxChars));
  };

  return (
    <div className="w-full">
      <div className="relative border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-sm hover:shadow focus-within:shadow-md focus-within:border-slate-400 dark:focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-400/20 dark:focus-within:ring-slate-600/20 transition-all duration-200">
        
        {/* Text Input Row */}
        <div className="flex items-end pl-3 pr-2.5 py-2.5">
          {/* Attachment Placeholder Button */}
          <button 
            type="button"
            title="Attach file (disabled)"
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mr-1 cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.013 2.25c-5.383 0-9.75 4.367-9.75 9.75s4.367 9.75 9.75 9.75 9.75-4.367 9.75-9.75-4.367-9.75-9.75-9.75zm0 18a8.25 8.25 0 110-16.5 8.25 8.25 0 010 16.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.5v9m-4.5-4.5h9" />
            </svg>
          </button>

          {/* Growing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={isLoading ? "AI is processing..." : "Message AI Assistant..."}
            className="flex-1 max-h-52 min-h-[40px] py-2 px-1 text-[14px] md:text-[15px] bg-transparent text-slate-800 dark:text-slate-100 border-none outline-none resize-none focus:ring-0 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 cursor-pointer transition-colors shadow-sm disabled:shadow-none flex-shrink-0 ml-1.5"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Footer Details: Character Count */}
      <div className="flex justify-between items-center mt-1.5 px-2 select-none">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Press Enter to send, Shift+Enter for new line
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
          {input.length}/{maxChars}
        </span>
      </div>
    </div>
  );
};
