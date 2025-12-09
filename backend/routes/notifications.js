const express = require('express');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

const router = express.Router();

function auth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.sub;
    req.role = decoded.role || 'patient';
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

// Get notifications for current user (patient or doctor)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.role === 'doctor' 
      ? { doctorId: req.userId }
      : { userId: req.userId };
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Failed to load notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to load notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const query = req.role === 'doctor'
      ? { _id: req.params.id, doctorId: req.userId }
      : { _id: req.params.id, userId: req.userId };
    
    const notification = await Notification.findOneAndUpdate(
      query,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const query = req.role === 'doctor'
      ? { doctorId: req.userId, isRead: false }
      : { userId: req.userId, isRead: false };
    
    await Notification.updateMany(query, { isRead: true });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
});

module.exports = router;


