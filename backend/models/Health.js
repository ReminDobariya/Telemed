const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  type: String,
  value: String,
  unit: String,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  // Type: 'structured' (created by doctor/lab) or 'unstructured' (uploaded by patient)
  type: { type: String, enum: ['structured', 'unstructured'], default: 'unstructured' },
  // For structured reports
  uploaderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'reports.uploaderType' }, // Doctor or Lab ID
  uploaderType: { type: String, enum: ['Doctor', 'Lab'], default: 'Doctor' },
  testType: { type: String }, // blood test, urine test, thyroid panel, X-ray, MRI, CT scan, ECG, etc.
  reportName: { type: String },
  findings: { type: String },
  summary: { type: String },
  recommendations: { type: String },
  verifiedByDoctor: { type: Boolean, default: false }, // Flag to indicate if verified by doctor
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // Doctor who verified
  // For unstructured reports (patient uploads)
  reportDate: { type: Date }, // Date of the report
  labName: { type: String }, // Lab name (for patient uploads)
  patientNotes: { type: String }, // Optional notes from patient
  // Common fields
  fileUrl: { type: String }, // PDF or image URL
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const HealthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  vitals: { type: [VitalSchema], default: [] },
  reports: { type: [ReportSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.models.Health || mongoose.model('Health', HealthSchema);




