const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', index: true },
  doctor: { type: String }, // Legacy field, keep for backward compatibility
  time: { type: Date, required: true },
  reason: String,
  status: { 
    type: String, 
    enum: ['pending', 'scheduled', 'accepted', 'rejected', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  mode: { type: String, enum: ['virtual', 'in-person'], default: 'virtual' },
  notes: { type: String }, // Doctor's consultation notes
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);



