const express = require('express');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Get all active doctors (public endpoint)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('-passwordHash')
      .sort({ name: 1 });
    
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Failed to load doctors:', error);
    res.status(500).json({ success: false, error: 'Failed to load doctors' });
  }
});

// Get doctor by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-passwordHash');
    
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    
    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Failed to load doctor:', error);
    res.status(500).json({ success: false, error: 'Failed to load doctor' });
  }
});

module.exports = router;


