const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

function signToken(doctor) {
  const payload = { sub: doctor.id, email: doctor.email, role: 'doctor' };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('phone').optional().isString(),
  body('specialization').trim().isLength({ min: 2 }).withMessage('Specialization required'),
  body('experience').optional().isInt({ min: 0 }),
  body('photo').optional().isString(),
  body('languages').optional().isArray(),
  body('mode').optional().isIn(['virtual', 'in-person', 'both']),
  body('fees').isFloat({ min: 0 }).withMessage('Fees required'),
  body('bio').optional().isString(),
  body('qualifications').optional().isArray(),
], validate, async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience, photo, languages, mode, fees, bio, qualifications } = req.body;
    const exists = await Doctor.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      specialization,
      experience: experience || 0,
      photo,
      languages: languages || ['en'],
      mode: mode || 'both',
      fees,
      bio,
      qualifications: qualifications || [],
    });
    
    const token = signToken({ id: doctor._id, email: doctor.email });
    res.json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to register doctor' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 1 }).withMessage('Password required'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (!doctor) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (!doctor.isActive) return res.status(403).json({ success: false, error: 'Account is inactive' });
    
    const ok = await bcrypt.compare(password, doctor.passwordHash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = signToken({ id: doctor._id, email: doctor.email });
    res.json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        photo: doctor.photo,
      }
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
});

function auth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Not a doctor account' });
    }
    
    req.doctorId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, error: 'Not a doctor account' });
    }
    
    const doctor = await Doctor.findById(decoded.sub).select('-passwordHash');
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
});

// Update doctor profile
router.put('/profile', auth, [
  body('name').optional().isLength({ min: 2 }),
  body('phone').optional().isString(),
  body('specialization').optional().isLength({ min: 2 }),
  body('experience').optional().isInt({ min: 0 }),
  body('photo').optional().isString(),
  body('languages').optional().isArray(),
  body('mode').optional().isIn(['virtual', 'in-person', 'both']),
  body('fees').optional().isFloat({ min: 0 }),
  body('bio').optional().isString(),
  body('qualifications').optional().isArray(),
], validate, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.doctorId,
      { $set: req.body },
      { new: true }
    ).select('-passwordHash');
    
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    
    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Failed to update doctor profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

module.exports = { router };


