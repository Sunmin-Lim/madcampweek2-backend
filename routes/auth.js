// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// 회원가입
router.post('/register', async (req, res) => {
    console.log('✅ [REGISTER] 요청 받음!');
    console.log('📌 요청 바디:', req.body);
  
    const { email, password, username } = req.body;
  
    try {
      // 이메일 중복 체크
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
  
      // 비밀번호 해시
      const password_hash = await bcrypt.hash(password, 10);
  
      // 새 사용자 생성
      const newUser = new User({ email, password_hash, username });
      await newUser.save();
  
      console.log('✅ 새 사용자 생성 완료:', newUser);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('❌ [REGISTER] 에러:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });  

// 로그인
router.post('/login', async (req, res) => {
  console.log('✅ [LOGIN] 요청 받음!');
  console.log('📌 요청 바디:', req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found!');
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('❌ Invalid password!');
      return res.status(401).json({ message: 'Invalid password' });
    }

    // JWT 생성
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    console.log('✅ JWT 토큰 발급 완료:', token);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('❌ [LOGIN] 에러:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
