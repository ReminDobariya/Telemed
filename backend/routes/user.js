const express = require('express');
const { body, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Profile data store
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    const user = await User.findById(req.userId);
    const merged = Object.assign({}, profile ? profile.toObject() : {}, {
      name: user?.name,
      email: user?.email,
    });
    res.json({ success: true, profile: merged });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load profile' })
  }
});

router.put('/profile', auth, [
  body('name').optional().isLength({ min: 2 }),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('dob').optional().isISO8601(),
  body('gender').optional().isIn(['male','female','other']),
  body('bloodGroup').optional().isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  body('height').optional().isFloat({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('profilePhotoUrl').optional().isString(),
], validate, async (req, res) => {
  try {
    const { name, height, weight, ...rest } = req.body;
    // Compute BMI if height/weight provided (height in cm, weight in kg)
    let bmiUpdate = {};
    if (typeof height === 'number' && typeof weight === 'number' && height > 0) {
      const meters = height / 100;
      const bmi = Number((weight / (meters * meters)).toFixed(1));
      bmiUpdate = { bmi };
    }
    const userPromise = name ? User.findByIdAndUpdate(req.userId, { name }, { new: true }) : Promise.resolve(null);
    const profilePromise = Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { ...rest, height, weight, ...bmiUpdate } },
      { upsert: true, new: true }
    );
    const [user, profile] = await Promise.all([userPromise, profilePromise]);
    res.json({ success: true, profile, user: user ? { id: user._id, name: user.name, email: user.email } : undefined });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update profile' })
  }
});

module.exports = router;


