const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  username: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  clonedRepos: [{ type: String }] // 클론한 Git 리포지토리 URL을 배열로 저장
});

module.exports = mongoose.model('User', userSchema);
