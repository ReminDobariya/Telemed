const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');

const User = require('../models/User');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

function signToken(user) {
  const payload = { sub: user.id, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('gender').optional().isString(),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('emergencyName').optional().isString(),
  body('emergencyPhone').optional().isString(),
], validate, async (req, res) => {
  const { name, email, password, gender, age, phone, address, emergencyName, emergencyPhone } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ success: false, error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: { gender, age, phone, address, emergencyPhone, emergencyName } },
    { upsert: true, new: true }
  );
  const token = signToken({ id: user._id, email: user.email });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 1 }).withMessage('Password required'),
], validate, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const token = signToken({ id: user._id, email: user.email });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
});

module.exports = { router };


