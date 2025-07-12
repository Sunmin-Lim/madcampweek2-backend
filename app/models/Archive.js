const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoUrl: { type: String, required: true },
  repoName: { type: String },
  description: { type: String },
  readme: { type: String },
  language: { type: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Archive', ArchiveSchema);
