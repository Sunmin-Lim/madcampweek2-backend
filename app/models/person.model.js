const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  online: { type: Boolean, default: false }
});

personSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Person', personSchema);
