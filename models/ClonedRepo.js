// models/ClonedRepo.js

const mongoose = require('mongoose');

const clonedRepoSchema = new mongoose.Schema({
    user_id: {
        type: String, required: true
      },
    repo_id: { type: String, required: true, unique: true },
    repo_url: { type: String, required: true },
    can_push: { type: Boolean, default: false },  // can_push 기본값 false
    already_push: {type: Boolean, default: false}, // already_push 기본값 false
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: false }, // 세션 ID는 필수 아님
    runed_at: { type: Date, default: Date.now, required: false}  // runed_at 기본값으로 현재 시간
  });

module.exports = mongoose.model('ClonedRepo', clonedRepoSchema);    
