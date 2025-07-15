// models/User.js
const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password_hash: { type: String, required: true },
//   username: { type: String, required: true },
//   created_at: { type: Date, default: Date.now },
//   clonedRepos: [{ type: String }] // 클론한 Git 리포지토리 URL을 배열로 저장
// });

const userSchema = new mongoose.Schema({
  email: { type: String },
  username: { type: String, required: true },
  password_hash: {
    type: String,
    required: function () {
      return this.authType === 'local'; // local 사용자만 필요
    },
  },
  githubId: { type: String, unique: true, sparse: true }, // GitHub에서 온 사용자 구분
  authType: { type: String, enum: ['local', 'github'], default: 'local' },
  clonedRepos: [{ type: String }], // 클론한 Git 리포지토리 URL을 배열로 저장
  // 클론한 리포지토리의 ObjectId 배열 (ClonedRepo 모델의 참조)
  clonedRepoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClonedRepo' }], // ClonedRepo 모델 참조
  logout: { type: Boolean, default: true, required: true }, // 로그아웃 상태, 기본적으로 logout된 상태 true
});


module.exports = mongoose.model('User', userSchema);
