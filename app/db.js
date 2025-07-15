require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('✅ DB connected from db.js');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ DB connection error:', err);
});

module.exports = mongoose;
