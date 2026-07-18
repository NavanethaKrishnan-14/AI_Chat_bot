import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../services/chatbotApi';
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  getMe,
  getToken, setToken, clearToken,
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversationApi,
} from '../services/authApi';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY_CONVS = 'v2_ai_conversations';
const STORAGE_KEY_ACTIVE_ID = 'v2_ai_active_conv_id';

const INITIAL_WELCOME = {
  id: 'sys_welcome',
  role: 'bot',
  content: "Hello! I'm your AI Assistant. I can assist with system engineering, code generation, or analyzing workflows. How can I help you today?",
  timestamp: new Date().toISOString(),
};

const makeNewConv = (id) => ({
  id: id || `conv_${Date.now()}`,
  title: 'New Chat',
  messages: [INITIAL_WELCOME],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useChat = () => {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);   // restoring session
  const [authError, setAuthError] = useState(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // ── Conversation state ──────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastMessage, setLastMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');

  // Backward compat widget states (unused in full-page layout but kept for API parity)
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // ── Online/offline ──────────────────────────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) { setAuthLoading(false); return; }

      try {
        const data = await getMe();
        setUser(data.user);
        await loadConversationsFromDB();
      } catch {
        clearToken();
        loadConversationsFromLocalStorage();
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local storage fallback helpers ──────────────────────────────────────────
  const loadConversationsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONVS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
        const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
        const firstId = parsed[0]?.id || '';
        setActiveConversationId(storedActiveId || firstId);
        return;
      }
    } catch {}
    // Fresh start
    const init = makeNewConv();
    setConversations([init]);
    setActiveConversationId(init.id);
  };

  const saveConversationsToLocalStorage = useCallback((convs, activeId) => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(convs));
      if (activeId) localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
    } catch {}
  }, []);

  // ── MongoDB helpers ──────────────────────────────────────────────────────────
  const loadConversationsFromDB = async () => {
    try {
      const data = await fetchConversations();
      if (data.conversations?.length > 0) {
        setConversations(data.conversations);
        const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
        const firstId = data.conversations[0]?.id || '';
        setActiveConversationId(storedActiveId || firstId);
      } else {
        // Create default conversation if none exist
        const init = makeNewConv();
        setConversations([init]);
        setActiveConversationId(init.id);
        await createConversation(init).catch(() => {});
      }
    } catch {
      loadConversationsFromLocalStorage();
    }
  };

  const syncConvToDB = useCallback(async (conv) => {
    if (!getToken()) return;
    try {
      await updateConversation(conv.id, { title: conv.title, messages: conv.messages });
    } catch {}
  }, []);

  // ── Auth actions ─────────────────────────────────────────────────────────────
  const loginUserAction = useCallback(async (email, password) => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const data = await apiLogin(email, password);
      setToken(data.token);
      setUser(data.user);
      await loadConversationsFromDB();
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsAuthSubmitting(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const registerUserAction = useCallback(async (name, email, password) => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const data = await apiRegister(name, email, password);
      setToken(data.token);
      setUser(data.user);
      // Create initial conversation in DB for new user
      const init = makeNewConv();
      setConversations([init]);
      setActiveConversationId(init.id);
      await createConversation(init).catch(() => {});
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsAuthSubmitting(false);
    }
  }, []);

  const socialLoginAction = useCallback(async (platform) => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    const email = `${platform.toLowerCase()}.user@example.com`;
    const name = `${platform} User`;
    const password = `SocialSecurePass123!_${platform}`;
    try {
      let data;
      try {
        data = await apiLogin(email, password);
      } catch (loginErr) {
        data = await apiRegister(name, email, password);
      }
      setToken(data.token);
      setUser(data.user);
      await loadConversationsFromDB();
    } catch (err) {
      setAuthError(err.message || `Failed to sign in with ${platform}.`);
    } finally {
      setIsAuthSubmitting(false);
    }
  }, []);

  const logoutUser = useCallback(() => {
    clearToken();
    setUser(null);
    setConversations([]);
    setActiveConversationId('');
    setApiError(null);
    setLastMessage('');
    setAuthError(null);
    // Reset to fresh local session
    const init = makeNewConv();
    setConversations([init]);
    setActiveConversationId(init.id);
  }, []);

  // ── Derived active conversation & messages ───────────────────────────────────
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0] || null;
  const messages = activeConversation?.messages || [];

  // ── Send message ──────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const trimmedText = text.trim();
    setLastMessage(trimmedText);

    const userPayload = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: trimmedText,
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);
    setApiError(null);

    let updatedConv = null;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversationId) {
          const isDefault = c.title === 'New Chat';
          const newTitle = isDefault
            ? (trimmedText.length > 28 ? trimmedText.substring(0, 28) + '...' : trimmedText)
            : c.title;
          updatedConv = { ...c, title: newTitle, messages: [...c.messages, userPayload], updatedAt: new Date().toISOString() };
          return updatedConv;
        }
        return c;
      })
    );

    // Sync the user's message immediately to the DB
    if (updatedConv) {
      syncConvToDB(updatedConv);
    }

    try {
      const data = await sendChatMessage(trimmedText);
      if (!data) return;

      const botPayload = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConversationId) {
            const final = { ...c, messages: [...c.messages, botPayload], updatedAt: new Date().toISOString() };
            syncConvToDB(final);
            return final;
          }
          return c;
        })
      );
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, isLoading, syncConvToDB]);

  const retry = useCallback(() => {
    if (lastMessage) handleSendMessage(lastMessage);
  }, [lastMessage, handleSendMessage]);

  const handleClearChat = useCallback(() => {
    if (!window.confirm('Are you sure you want to wipe this conversation?')) return;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversationId) {
          const cleared = { ...c, title: 'New Chat', messages: [INITIAL_WELCOME], updatedAt: new Date().toISOString() };
          syncConvToDB(cleared);
          return cleared;
        }
        return c;
      })
    );
    setApiError(null);
    setLastMessage('');
  }, [activeConversationId, syncConvToDB]);

  // ── Multi-conversation management ─────────────────────────────────────────────
  const createNewConversation = useCallback(async () => {
    const newConv = makeNewConv();
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setApiError(null);
    setLastMessage('');

    if (getToken()) {
      await createConversation(newConv).catch(() => {});
    }
  }, []);

  const selectConversation = useCallback(id => {
    setActiveConversationId(id);
    setApiError(null);
    setLastMessage('');
  }, []);

  const deleteConversation = useCallback(async (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id) {
        const newActive = filtered[0]?.id;
        if (newActive) setTimeout(() => setActiveConversationId(newActive), 0);
        else {
          const fresh = makeNewConv();
          setTimeout(() => {
            setConversations([fresh]);
            setActiveConversationId(fresh.id);
            if (getToken()) createConversation(fresh).catch(() => {});
          }, 0);
          return [fresh];
        }
      }
      return filtered;
    });

    if (getToken()) {
      await deleteConversationApi(id).catch(() => {});
    }
  }, [activeConversationId]);

  const renameConversation = useCallback(async (id, newTitle) => {
    if (!newTitle.trim()) return;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === id) {
          const renamed = { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() };
          syncConvToDB(renamed);
          return renamed;
        }
        return c;
      })
    );
  }, [syncConvToDB]);

  // Persist to local storage whenever conversations change (as an additional backup)
  useEffect(() => {
    if (!user && conversations.length > 0) {
      saveConversationsToLocalStorage(conversations, activeConversationId);
    }
  }, [conversations, activeConversationId, user, saveConversationsToLocalStorage]);

  // ── Filter for search ─────────────────────────────────────────────────────────
  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.messages.some(m => m.content.toLowerCase().includes(q));
  });

  return {
    // Auth
    user, authLoading, authError, isAuthSubmitting,
    loginUser: loginUserAction,
    registerUser: registerUserAction,
    socialLogin: socialLoginAction,
    logoutUser,

    // Chat
    messages, isLoading, apiError,
    handleSendMessage, handleClearChat, isOnline, retry,

    // Widget compat
    isExpanded, setIsExpanded, isMinimized, setIsMinimized,

    // Conversations
    conversations: filteredConversations,
    allConversations: conversations,
    activeConversationId,
    searchQuery, setSearchQuery,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
  };
};
