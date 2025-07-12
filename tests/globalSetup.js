// tests/globalSetup.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Session = require('../app/models/session.model'); // Adjust path to your Session model

module.exports = async () => {
  // Load environment variables (e.g., MONGO_URI)
  // This is crucial for Jest's global setup context
  dotenv.config();

  console.log('\n✨ [Global Setup] Connecting to MongoDB...');
  try {
    // Connect to MongoDB, using a fallback URI if process.env.MONGO_URI is undefined
    // await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase_test', { // Added fallback
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase');



    console.log('✅ [Global Setup] MongoDB connected successfully.');

    // Clean all existing sessions from the database before any tests run.
    await Session.deleteMany({});
    console.log('✅ [Global Setup] All existing sessions cleared from DB.');

  } catch (error) {
    console.error('❌ [Global Setup] MongoDB connection failed:', error);
    // Exit the test process if DB connection fails, as tests won't work
    process.exit(1);
  }

  // Store the mongoose connection object for globalTeardown
  global.__MONGO_CLIENT__ = mongoose.connection.getClient();
};