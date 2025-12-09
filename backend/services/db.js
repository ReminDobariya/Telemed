const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telemed';
  const dbName = process.env.MONGO_DB || undefined;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName });
  console.log('🗄️  MongoDB connected');
}

module.exports = { connectMongo };




