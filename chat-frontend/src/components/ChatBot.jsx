import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWindow } from './ChatWindow';
import { AuthScreen } from './AuthScreen';

export const ChatBot = () => {
  const {
    messages,
    isLoading,
    apiError,
    handleSendMessage,
    handleClearChat,
    isOnline,
    retry,

    // Auth
    user,
    authLoading,
    authError,
    isAuthSubmitting,
    loginUser,
    registerUser,
    socialLogin,
    logoutUser,

    // Conversations
    conversations,
    activeConversationId,
    searchQuery,
    setSearchQuery,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
  } = useChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Always force dark OLED mode
  useEffect(() => {
    try {
      document.documentElement.classList.add('dark', 'night');
    } catch {}
  }, []);

  // ── Loading screen while restoring session ─────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Restoring your session...</p>
        </div>
      </div>
    );
  }

  // ── Auth Gate — show login screen if not logged in ─────────────────────────
  if (!user) {
    return (
      <AuthScreen
        onLogin={loginUser}
        onRegister={registerUser}
        onSocialLogin={socialLogin}
        isLoading={isAuthSubmitting}
        authError={authError}
      />
    );
  }

  // ── Main Chat App ─────────────────────────────────────────────────────────
  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeTitle = activeConv?.title || 'New Chat';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onCreateNew={createNewConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onLogout={logoutUser}
      />

      {/* Main Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatTitle={activeTitle}
          onClearChat={handleClearChat}
          isOnline={isOnline}
          onCreateNew={createNewConversation}
        />

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          apiError={apiError}
          isOnline={isOnline}
          retry={retry}
          onSendMessage={handleSendMessage}
          input={input}
          setInput={setInput}
        />
      </div>
    </div>
  );
};
