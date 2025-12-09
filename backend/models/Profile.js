const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, unique: true },
  // Personal
  name: String,
  age: Number,
  dob: Date,
  gender: { type: String, enum: ['male','female','other'], default: 'other' },
  phone: String,
  email: String,
  address: String,
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], default: undefined },
  height: { type: Number }, // store in cm
  weight: { type: Number }, // store in kg
  bmi: { type: Number },
  profilePhotoUrl: { type: String },
  // Legacy emergency fields
  emergencyName: String,
  emergencyPhone: String,
}, { timestamps: true });

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);




