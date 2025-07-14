const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() { return this.authType === 'local'; }, // Email is required for local auth
    unique: true, // Email must be unique for all users
    sparse: true // Allows null values for unique fields (useful for GitHub users without email, but still enforces uniqueness if present)
  },
  username: {
    type: String,
    required: true,
    unique: true // Username must be unique
  },
  password_hash: {
    type: String,
    required: function () {
      return this.authType === 'local'; // password_hash is required only for local users
    },
  },
  githubId: { type: String, unique: true, sparse: true }, // GitHub에서 온 사용자 구분
  authType: { type: String, enum: ['local', 'github'], default: 'local' },
  clonedRepos: [{ type: String }] // ✅ ADDED: 클론한 Git 리포지토리 URL을 배열로 저장
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

module.exports = mongoose.model('User', userSchema);

