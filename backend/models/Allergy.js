const mongoose = require('mongoose');

const AllergySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  substance: { type: String, required: true },
  reaction: { type: String, required: true },
  severity: { type: String, enum: ['mild','moderate','severe'], required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Allergy || mongoose.model('Allergy', AllergySchema);


