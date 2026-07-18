const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Conversation = require('./models/Conversation');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_this';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_chat_db';

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── JWT Auth Middleware ─────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

// ─── Auth Routes ─────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are all required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email: email.toLowerCase(), password: hashedPassword });
    await user.save();

    // Sign JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Register] Error:', err);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log(`[Login Attempt] Email: "${trimmedEmail}"`);

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log(`[Login Failed] No user found for: "${trimmedEmail}"`);
      return res.status(401).json({ message: 'No account found with that email address.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Login Failed] Incorrect password for: "${trimmedEmail}"`);
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    console.log(`[Login Success] User authenticated: "${trimmedEmail}"`);

    // Sign JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Login] Error:', err);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

// GET /api/auth/me - Verify session and return user info
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth/Me] Error:', err);
    res.status(500).json({ message: 'Server error fetching user data.' });
  }
});

// ─── Conversation Routes (all protected by requireAuth) ──────────────────────

// GET /api/conversations - Load all conversations for logged-in user
app.get('/api/conversations', requireAuth, async (req, res) => {
  try {
    const conversations = await Conversation
      .find({ userId: req.userId })
      .sort({ updatedAt: -1 });

    res.status(200).json({ conversations });
  } catch (err) {
    console.error('[GET /api/conversations] Error:', err);
    res.status(500).json({ message: 'Failed to fetch conversations.' });
  }
});

// POST /api/conversations - Save or update a conversation (upsert)
app.post('/api/conversations', requireAuth, async (req, res) => {
  try {
    const { id, title, messages } = req.body;
    if (!id || !title) {
      return res.status(400).json({ message: 'Conversation id and title are required.' });
    }

    // Upsert: create if not exists, update if it does
    const conv = await Conversation.findOneAndUpdate(
      { id, userId: req.userId },
      {
        $set: {
          id,
          userId: req.userId,
          title,
          messages: messages || [],
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({ conversation: conv });
  } catch (err) {
    console.error('[POST /api/conversations] Error:', err.message);
    res.status(500).json({ message: 'Failed to save conversation.', detail: err.message });
  }
});

// PUT /api/conversations/:id - Update an existing conversation
app.put('/api/conversations/:id', requireAuth, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const conv = await Conversation.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { title, messages, updatedAt: Date.now() },
      {
        returnDocument: "after"
      }
    );
    if (!conv) {
      return res.status(404).json({ message: 'Conversation not found or access denied.' });
    }
    res.status(200).json({ conversation: conv });
  } catch (err) {
    console.error('[PUT /api/conversations/:id] Error:', err);
    res.status(500).json({ message: 'Failed to update conversation.' });
  }
});

// DELETE /api/conversations/:id - Delete a conversation
app.delete('/api/conversations/:id', requireAuth, async (req, res) => {
  try {
    const result = await Conversation.findOneAndDelete({
      id: req.params.id,
      userId: req.userId
    });
    if (!result) {
      return res.status(404).json({ message: 'Conversation not found or access denied.' });
    }
    res.status(200).json({ message: 'Conversation deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/conversations/:id] Error:', err);
    res.status(500).json({ message: 'Failed to delete conversation.' });
  }
});

// ─── Legacy Chat Route (kept for backwards compatibility) ────────────────────
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  console.log(`Received message from frontend: "${message}"`);

  let botReply = `I received your message: "${message}". The backend server is fully alive and responding!`;
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    botReply = "Hello there! I am your live backend assistant. How can I help you today?";
  } else if (message.toLowerCase().includes('help')) {
    botReply = "Sure thing! I can help you process data, manage states, or eventually link up to an AI brain.";
  }
  res.status(200).json({ reply: botReply });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});