const mongoose = require('mongoose');

const userPinnedLinkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
});

module.exports = mongoose.model('UserPinnedLink', userPinnedLinkSchema);
