import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { EmptyState } from './EmptyState';
import { MessageInput } from './MessageInput';
import { LoadingIndicator } from './LoadingIndicator';

export const ChatWindow = ({
  messages,
  isLoading,
  apiError,
  isOnline,
  retry,
  onSendMessage,
  input,
  setInput,
  welcomeMessage
}) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages or loading states change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const onFormSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleSelectSuggestion = (promptText) => {
    onSendMessage(promptText);
  };

  // Define if the chat is completely fresh (only the initial welcome message)
  const isFreshSession = messages.length <= 1;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 overflow-hidden relative">
      
      {/* Scrollable Conversation View */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin flex flex-col"
      >
        {isFreshSession ? (
          <EmptyState 
            onSelectPrompt={handleSelectSuggestion} 
            welcomeMessage={messages[0]?.content || welcomeMessage}
          />
        ) : (
          <div className="flex-1 flex flex-col py-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading / Typing Indicator */}
            {isLoading && <LoadingIndicator />}
            
            {/* System Status Indicators */}
            {!isOnline && (
              <div className="max-w-2xl mx-auto w-full px-4 md:px-6 my-4 select-none">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs text-center py-2.5 px-4 rounded-xl shadow-sm">
                  ⚠️ You are offline — check your internet connection
                </div>
              </div>
            )}

            {apiError && isOnline && (
              <div className="max-w-2xl mx-auto w-full px-4 md:px-6 my-4 select-none animate-fade-in">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 text-xs text-center py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center space-x-2">
                  <span>⚠️ {apiError}</span>
                  <button 
                    type="button" 
                    onClick={retry} 
                    className="underline font-semibold hover:text-amber-600 dark:hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input area at bottom */}
      <footer className="p-4 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent flex-shrink-0 z-20">
        <div className="max-w-3xl w-full mx-auto">
          <MessageInput
            input={input}
            setInput={setInput}
            onSubmit={onFormSubmit}
            isLoading={isLoading}
          />
        </div>
      </footer>

    </div>
  );
};
