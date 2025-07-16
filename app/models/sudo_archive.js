// /app/models/sudo_archive.js

const mongoose = require('mongoose');

const sudoArchiveSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        unique: true,  // 사용자 이름이 중복되지 않도록 설정
    },
    user_password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SudoArchive', sudoArchiveSchema);