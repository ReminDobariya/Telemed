const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
// PDF generation - using a simple approach without pdfkit dependency
// If pdfkit is needed, install it: npm install pdfkit
const fs = require('fs');
const path = require('path');

const router = express.Router();

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error('❌ Doctor Prescription Auth: No Bearer token found');
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.error('❌ Doctor Prescription Auth: Empty token');
      return res.status(401).json({ success: false, error: 'Empty authorization token' });
    }
    
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    
    if (!decoded.role) {
      console.error('❌ Doctor Prescription Auth: No role in token', decoded);
      return res.status(403).json({ success: false, error: 'Invalid token: no role found' });
    }
    
    if (decoded.role !== 'doctor') {
      console.error('❌ Doctor Prescription Auth: Wrong role', decoded.role);
      return res.status(403).json({ success: false, error: `Doctor access required, got role: ${decoded.role}` });
    }
    
    if (!decoded.sub) {
      console.error('❌ Doctor Prescription Auth: No sub in token', decoded);
      return res.status(403).json({ success: false, error: 'Invalid token: no doctor ID found' });
    }
    
    req.doctorId = decoded.sub;
    next();
  } catch (e) {
    console.error('❌ Doctor Prescription Auth Error:', e.message);
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized', details: e.message });
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

// Create prescription
router.post('/', auth, [
  body('userId').isMongoId().withMessage('Patient ID required'),
  body('appointmentId').optional().isMongoId(),
  body('medications').isArray().withMessage('Medications array required'),
  body('medications.*.name').isString().notEmpty(),
  body('medications.*.dosage').isString().notEmpty(),
  body('medications.*.frequency').isString().notEmpty(),
  body('medications.*.duration').isString().notEmpty(),
  body('notes').optional().isString(),
  body('followUpDate').optional().isISO8601(),
  body('testsRecommended').optional().isArray(),
], validate, async (req, res) => {
  try {
    const { userId, appointmentId, medications, notes, followUpDate, testsRecommended } = req.body;
    
    // Create prescription document
    const prescription = await Prescription.create({
      userId,
      doctorId: req.doctorId,
      appointmentId,
      medications,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      testsRecommended: testsRecommended || [],
      createdAt: new Date(),
    });
    
    // Update appointment with prescription ID
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { prescriptionId: prescription._id });
    }
    
    // Create notification for patient
    await Notification.create({
      userId,
      type: 'prescription_uploaded',
      title: 'New Prescription',
      message: 'A new prescription has been uploaded for you.',
      prescriptionId: prescription._id,
      appointmentId,
    });
    
    res.json({ success: true, prescription });
  } catch (error) {
    console.error('Failed to create prescription:', error);
    res.status(500).json({ success: false, error: 'Failed to create prescription' });
  }
});

// Generate PDF for prescription (simplified - returns JSON for now)
// For full PDF generation, install pdfkit: npm install pdfkit
router.get('/:id/pdf', auth, [
  param('id').isMongoId(),
], validate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name specialization');
    
    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }
    
    // For now, return prescription data as JSON
    // In production, use pdfkit or another PDF library to generate actual PDF
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="prescription_${prescription._id}.json"`);
    res.json({
      prescription: {
        patient: prescription.userId?.name || 'N/A',
        date: new Date(prescription.createdAt).toLocaleDateString(),
        doctor: prescription.doctorId ? `Dr. ${prescription.doctorId.name}` : 'N/A',
        specialization: prescription.doctorId?.specialization || 'N/A',
        medications: prescription.medications || [],
        notes: prescription.notes || '',
        testsRecommended: prescription.testsRecommended || [],
        followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : null,
      }
    });
    
    // TODO: Implement actual PDF generation with pdfkit:
    // const PDFDocument = require('pdfkit');
    // const doc = new PDFDocument();
    // ... generate PDF content ...
    // doc.pipe(res);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

module.exports = router;

