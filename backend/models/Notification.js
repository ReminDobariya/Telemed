const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', index: true },
  type: { 
    type: String, 
    enum: [
      'appointment_request',
      'appointment_accepted',
      'appointment_rejected',
      'appointment_rescheduled',
      'prescription_uploaded',
      'report_uploaded',
      'message'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);


