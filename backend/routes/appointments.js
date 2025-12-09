const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
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

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

router.get('/', auth, (req, res) => {
  Appointment.find({ userId: req.userId }).sort({ time: 1 }).then(appointments => {
    res.json({ success: true, appointments });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to load appointments' }));
});

router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.userId })
      .populate('doctorId', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to load appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to load appointment' });
  }
});

router.post('/', auth, [
  body('doctorId').isMongoId().withMessage('Doctor ID required'),
  body('time').isISO8601().withMessage('time must be ISO string'),
  body('reason').optional().isString(),
  body('mode').optional().isIn(['virtual', 'in-person']),
], validate, async (req, res) => {
  try {
    const Doctor = require('../models/Doctor');
    const Notification = require('../models/Notification');
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    
    const appointment = await Appointment.create({
      userId: req.userId,
      doctorId: req.body.doctorId,
      doctor: doctor.name, // Legacy field
      time: req.body.time,
      reason: req.body.reason,
      mode: req.body.mode || 'virtual',
      status: 'pending',
    });
    
    // Create notification for doctor
    await Notification.create({
      doctorId: req.body.doctorId,
      type: 'appointment_request',
      title: 'New Appointment Request',
      message: `New appointment request from patient.`,
      appointmentId: appointment._id,
    });
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

router.put('/:id/cancel', auth, (req, res) => {
  Appointment.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { status: 'cancelled' }, { new: true })
    .then(doc => {
      if (!doc) return res.status(404).json({ success: false, error: 'Appointment not found' });
      res.json({ success: true, appointment: doc });
    }).catch(() => res.status(500).json({ success: false, error: 'Failed to cancel appointment' }));
});

module.exports = router;


