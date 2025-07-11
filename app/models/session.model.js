const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: String, required: true  },
  image_name: {
    type: String, required: true  },
  container_id: {
    type: String, required: true  },
  status: {
    type: String, enum: ['RUNNING', 'STOPPED'], default: 'RUNNING'  },
  created_at: {
    type: Date, default: Date.now  },
  last_active_at: {
    type: Date, default: Date.now  },
  resources: {
    type: Object, default: {}  }
});

module.exports = mongoose.model('Session', sessionSchema);
