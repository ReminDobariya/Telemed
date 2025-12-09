const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', index: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  // Type: 'doctor-generated' (structured, created by doctor) or 'patient-uploaded' (external, uploaded by patient)
  type: { type: String, enum: ['doctor-generated', 'patient-uploaded'], default: 'doctor-generated' },
  // For patient-uploaded prescriptions
  prescriptionDate: { type: Date }, // Date of the prescription (for external prescriptions)
  doctorName: { type: String }, // Doctor name (for external prescriptions)
  hospitalName: { type: String }, // Hospital name (for external prescriptions)
  fileUrl: { type: String }, // PDF or image URL (for patient-uploaded prescriptions)
  patientNotes: { type: String }, // Optional notes from patient (for external prescriptions)
  // Legacy fields for backward compatibility
  medication: { type: String },
  dosage: { type: String },
  instructions: { type: String },
  // New structure (for doctor-generated prescriptions)
  medications: { type: [MedicationSchema], default: [] },
  diagnosis: { type: String }, // Diagnosis from doctor
  notes: { type: String }, // Doctor's notes
  followUpDate: { type: Date },
  testsRecommended: { type: [String], default: [] },
  // PDF or image attachment (for doctor-generated prescriptions)
  attachmentUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);




