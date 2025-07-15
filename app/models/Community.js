const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  text: String
});

const CommunityPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  answers: [AnswerSchema],
  views: { type: Number, default: 0 }
});

const CommunityPost = mongoose.model('CommunityPost', CommunityPostSchema);

module.exports = { CommunityPost };
