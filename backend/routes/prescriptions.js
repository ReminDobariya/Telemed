const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
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
  Prescription.find({ userId: req.userId }).sort({ createdAt: -1 }).then(prescriptions => {
    res.json({ success: true, prescriptions });
  }).catch(() => res.status(500).json({ success: false, error: 'Failed to load prescriptions' }));
});

// Legacy route for backward compatibility
router.post('/', auth, [
  body('medication').isLength({ min: 2 }),
  body('dosage').isLength({ min: 1 }),
  body('instructions').optional().isString()
], validate, (req, res) => {
  Prescription.create({ userId: req.userId, medication: req.body.medication, dosage: req.body.dosage, instructions: req.body.instructions })
    .then(prescription => res.json({ success: true, prescription }))
    .catch(() => res.status(500).json({ success: false, error: 'Failed to create prescription' }));
});

// Patient upload prescription (external prescription)
router.post('/upload', auth, [
  body('prescriptionDate').isISO8601().withMessage('Prescription date required'),
  body('fileUrl').optional().isString(),
  body('doctorName').optional().isString(),
  body('hospitalName').optional().isString(),
  body('patientNotes').optional().isString(),
], validate, async (req, res) => {
  try {
    const { prescriptionDate, fileUrl, doctorName, hospitalName, patientNotes } = req.body;
    
    const prescription = await Prescription.create({
      userId: req.userId,
      type: 'patient-uploaded',
      prescriptionDate: new Date(prescriptionDate),
      fileUrl,
      doctorName,
      hospitalName,
      patientNotes,
    });
    
    res.json({ success: true, prescription });
  } catch (error) {
    console.error('Failed to upload prescription:', error);
    res.status(500).json({ success: false, error: 'Failed to upload prescription' });
  }
});

module.exports = router;


