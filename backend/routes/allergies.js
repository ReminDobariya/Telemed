const express = require('express');
const { body, validationResult, param } = require('express-validator');
const jwt = require('jsonwebtoken');
const Allergy = require('../models/Allergy');

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

router.get('/', auth, async (req, res) => {
  try {
    const items = await Allergy.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, allergies: items });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load allergies' });
  }
});

router.post('/', auth, [
  body('substance').isString().trim().notEmpty(),
  body('reaction').isString().trim().notEmpty(),
  body('severity').isIn(['mild','moderate','severe']),
  body('status').optional().isIn(['active', 'resolved']),
], validate, async (req, res) => {
  try {
    const created = await Allergy.create({ userId: req.userId, ...req.body });
    res.json({ success: true, allergy: created });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to add allergy' });
  }
});

router.delete('/:id', auth, [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const { id } = req.params;
    await Allergy.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete allergy' });
  }
});

module.exports = router;


