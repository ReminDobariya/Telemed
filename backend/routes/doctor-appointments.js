const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Medication = require('../models/Medication');
const Allergy = require('../models/Allergy');
const Prescription = require('../models/Prescription');
const Health = require('../models/Health');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

const router = express.Router();

function auth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Doctor access required' });
    }
    req.doctorId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

// Get all appointments for doctor with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = { doctorId: req.doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.time = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .sort({ time: 1 });
    
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Failed to load appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to load appointments' });
  }
});

// Get appointment by ID with full patient data
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.doctorId })
      .populate('userId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Get patient data
    const [profile, medications, allergies, prescriptions, health, conversations] = await Promise.all([
      Profile.findOne({ userId: appointment.userId }).lean(),
      Medication.find({ userId: appointment.userId }).lean(),
      Allergy.find({ userId: appointment.userId }).lean(),
      Prescription.find({ userId: appointment.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Health.findOne({ userId: appointment.userId }).lean(),
      Conversation.find({ userId: appointment.userId }).sort({ updatedAt: -1 }).limit(5).select('title messages updatedAt').lean(),
    ]);
    
    const user = await User.findById(appointment.userId);
    
    // Generate summaries for each conversation
    const conversationsWithSummaries = (conversations || []).map((c) => {
      let summary = '';
      if (c.messages && c.messages.length > 0) {
        // Get last 10 messages for summary
        const messages = c.messages.slice(-10);
        const conversationText = messages.map((m) => 
          `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content}`
        ).join('\n\n');
        
        // Create summary (truncate if too long)
        if (conversationText.length > 1000) {
          summary = conversationText.substring(0, 1000) + '...';
        } else {
          summary = conversationText;
        }
      }
      
      return {
        title: c.title || 'Chat',
        summary: summary || 'No messages yet',
        lastMessage: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].content.substring(0, 200) : '',
        updatedAt: c.updatedAt,
      };
    });
    
    res.json({
      success: true,
      appointment,
      patient: {
        name: user?.name,
        email: user?.email,
        profile: profile || {},
        medications: medications || [],
        allergies: allergies || [],
        prescriptions: prescriptions || [],
        reports: health?.reports || [],
        vitals: health?.vitals || [],
        recentChats: conversationsWithSummaries,
      }
    });
  } catch (error) {
    console.error('Failed to load appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to load appointment' });
  }
});

// Accept appointment
router.put('/:id/accept', auth, [
  param('id').isMongoId(),
  body('time').optional().isISO8601(),
], validate, async (req, res) => {
  try {
    const update = { status: 'accepted' };
    if (req.body.time) {
      update.time = new Date(req.body.time);
    }
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctorId },
      update,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Create notification for patient
    await Notification.create({
      userId: appointment.userId,
      type: 'appointment_accepted',
      title: 'Appointment Accepted',
      message: `Your appointment with Dr. ${req.body.doctorName || 'Doctor'} has been accepted.`,
      appointmentId: appointment._id,
    });
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to accept appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to accept appointment' });
  }
});

// Reject appointment
router.put('/:id/reject', auth, [
  param('id').isMongoId(),
  body('reason').optional().isString(),
], validate, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctorId },
      { status: 'rejected', notes: req.body.reason },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Create notification for patient
    await Notification.create({
      userId: appointment.userId,
      type: 'appointment_rejected',
      title: 'Appointment Rejected',
      message: `Your appointment has been rejected.${req.body.reason ? ' Reason: ' + req.body.reason : ''}`,
      appointmentId: appointment._id,
    });
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to reject appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to reject appointment' });
  }
});

// Reschedule appointment
router.put('/:id/reschedule', auth, [
  param('id').isMongoId(),
  body('time').isISO8601().withMessage('New time required'),
], validate, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctorId },
      { time: new Date(req.body.time), status: 'accepted' },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Create notification for patient
    await Notification.create({
      userId: appointment.userId,
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${new Date(req.body.time).toLocaleString()}.`,
      appointmentId: appointment._id,
    });
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to reschedule appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to reschedule appointment' });
  }
});

// Update appointment notes
router.put('/:id/notes', auth, [
  param('id').isMongoId(),
  body('notes').isString(),
], validate, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctorId },
      { notes: req.body.notes },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to update notes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
});

// Mark appointment as completed
router.put('/:id/complete', auth, [
  param('id').isMongoId(),
], validate, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctorId },
      { status: 'completed' },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to complete appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to complete appointment' });
  }
});

module.exports = router;


