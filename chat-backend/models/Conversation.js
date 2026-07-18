const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'bot', 'system']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
});

const ConversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Also update updatedAt when using findOneAndUpdate (used by the upsert POST handler)
ConversationSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Compound unique index: one conversation ID per user
ConversationSchema.index({ id: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
