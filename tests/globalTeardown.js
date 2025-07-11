// tests/globalTeardown.js
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('\n✨ [Global Teardown] Closing MongoDB connection...');
  try {
    if (mongoose.connection.readyState === 1) { // 1 means connected
      await mongoose.disconnect(); // Use disconnect for global teardown
      console.log('✅ [Global Teardown] MongoDB connection closed.');
    } else {
      console.warn('⚠️ [Global Teardown] MongoDB connection was not open.');
    }
  } catch (error) {
    console.error('❌ [Global Teardown] Error closing MongoDB connection:', error);
  }

  // Clean up global reference
  if (global.__MONGO_CLIENT__) {
      delete global.__MONGO_CLIENT__;
  }
};