const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const CommunityPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  answers: [AnswerSchema],
});

const UsefulLinkSchema = new mongoose.Schema({
  name: String,
  url: String,
});

const CommunityPost = mongoose.model('CommunityPost', CommunityPostSchema);
const UsefulLink = mongoose.model('UsefulLink', UsefulLinkSchema);

module.exports = { CommunityPost, UsefulLink };
