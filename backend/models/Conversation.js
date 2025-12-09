const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user','assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: Object
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, default: '' },
  messages: { type: [MessageSchema], default: [] },
  status: { type: String, enum: ['active','completed','archived'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);




