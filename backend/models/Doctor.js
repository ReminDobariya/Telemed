const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 }, // years
  photo: { type: String }, // URL or base64
  languages: { type: [String], default: ['en'] }, // ['en', 'hi', 'gu', 'mr']
  mode: { 
    type: String, 
    enum: ['virtual', 'in-person', 'both'], 
    default: 'both' 
  },
  fees: { type: Number, required: true }, // consultation fee
  bio: { type: String },
  qualifications: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);


