const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  isGroup: { type: Boolean, default: false },
  groupName: String
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
