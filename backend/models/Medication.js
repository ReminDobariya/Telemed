const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  startedOn: { type: String },
  endDate: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  takenDates: { type: [String], default: [] } // Array of dates (YYYY-MM-DD) when medication was taken
}, { timestamps: true });

module.exports = mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);


