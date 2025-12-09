const express = require('express');
const { body, validationResult, param } = require('express-validator');
const jwt = require('jsonwebtoken');
const Medication = require('../models/Medication');

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
    const items = await Medication.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, medications: items });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load medications' });
  }
});

router.post('/', auth, [
  body('name').isString().trim().notEmpty(),
  body('dosage').isString().trim().notEmpty(),
  body('frequency').isString().trim().notEmpty(),
  body('startedOn').optional().isString(),
  body('endDate').optional().isString(),
  body('notes').optional().isString(),
  body('status').optional().isIn(['active', 'completed', 'paused']),
], validate, async (req, res) => {
  try {
    const created = await Medication.create({ userId: req.userId, ...req.body });
    res.json({ success: true, medication: created });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to add medication' });
  }
});

router.delete('/:id', auth, [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const { id } = req.params;
    await Medication.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete medication' });
  }
});

// Mark medication as taken today
router.put('/:id/taken', auth, [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const medication = await Medication.findOne({ _id: id, userId: req.userId });
    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }
    
    // Add today's date if not already present
    if (!medication.takenDates || !medication.takenDates.includes(today)) {
      medication.takenDates = medication.takenDates || [];
      medication.takenDates.push(today);
      await medication.save();
    }
    
    res.json({ success: true, medication });
  } catch (error) {
    console.error('Failed to mark medication as taken:', error);
    res.status(500).json({ success: false, error: 'Failed to mark medication as taken' });
  }
});

// Unmark medication as taken today
router.put('/:id/untaken', auth, [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const medication = await Medication.findOne({ _id: id, userId: req.userId });
    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }
    
    // Remove today's date if present
    if (medication.takenDates && medication.takenDates.includes(today)) {
      medication.takenDates = medication.takenDates.filter((date) => date !== today);
      await medication.save();
    }
    
    res.json({ success: true, medication });
  } catch (error) {
    console.error('Failed to unmark medication as taken:', error);
    res.status(500).json({ success: false, error: 'Failed to unmark medication as taken' });
  }
});

module.exports = router;


