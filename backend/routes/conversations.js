const express = require('express');
const Conversation = require('../models/Conversation');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

function auth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

router.get('/', auth, (req, res) => {
  Conversation.find({ userId: req.userId }).sort({ updatedAt: -1 }).then(conversations => {
    res.json({ success: true, conversations });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to load conversations' }));
});

router.post('/', auth, (req, res) => {
  Conversation.create({ userId: req.userId, messages: [] })
    .then(conv => res.json({ success: true, conversation: conv }))
    .catch(() => res.status(500).json({ success: false, error: 'Failed to create conversation' }));
});

router.get('/:id', auth, (req, res) => {
  Conversation.findOne({ _id: req.params.id, userId: req.userId }).then(conv => {
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, conversation: conv });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to load conversation' }));
});

router.put('/:id', auth, (req, res) => {
  const { title } = req.body;
  Conversation.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { title: title || '' } },
    { new: true }
  ).then(conv => {
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, conversation: conv });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to update conversation' }));
});

router.delete('/:id', auth, (req, res) => {
  Conversation.findOneAndDelete({ _id: req.params.id, userId: req.userId }).then(conv => {
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, message: 'Conversation deleted' });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to delete conversation' }));
});

module.exports = router;


