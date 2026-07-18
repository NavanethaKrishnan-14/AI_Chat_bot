const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => {
  try { return localStorage.getItem('auth_token'); } catch { return null; }
};

export const setToken = (token) => {
  try { localStorage.setItem('auth_token', token); } catch {}
};

export const clearToken = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {}
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Server error (${res.status})`);
  }
  return data;
};

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const getMe = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── Conversation sync endpoints ──────────────────────────────────────────────
export const fetchConversations = async () => {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const createConversation = async (conv) => {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(conv),
  });
  return handleResponse(res);
};

export const updateConversation = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteConversationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};
