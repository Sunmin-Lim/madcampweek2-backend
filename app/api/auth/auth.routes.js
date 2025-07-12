const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../../models/User');
const authenticateToken = require('../../../middleware/authMiddleware'); // 미들웨어 임포트



require('./githubStrategy'); // <-- Loads the passport GitHub strategy


require('dotenv').config();  // .env 파일 로드
const router = express.Router();
// const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';

const SECRET_KEY = process.env.JWT_SECRET_KEY;
console.log('SECRET_KEY:', process.env.JWT_SECRET_KEY); // 비밀 키가 정상적으로 로드되는지 확인

/**
 * ================================================
 * ✅ Email/Password 회원가입
 * ================================================
 */
router.post('/register', async (req, res) => {
  console.log('✅ [REGISTER] 요청 받음!');
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password_hash, username });
    await newUser.save();

    console.log('✅ 새 사용자 생성 완료:', newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('❌ [REGISTER] 에러:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * ================================================
 * ✅ Email/Password 로그인
 * ================================================
 */
router.post('/login', async (req, res) => {
  console.log('✅ [LOGIN] 요청 받음!');
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('❌ Invalid password!');
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    console.log('✅ JWT 토큰 발급 완료:', token);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('❌ [LOGIN] 에러:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * ================================================
 * ✅ GitHub OAuth 로그인
 * ================================================
 */

// Step 1: Redirect to GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// Step 2: GitHub redirects back here
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    console.log('✅ GitHub 로그인 완료:', user);
    console.log('✅ JWT 발급:', token);

    // ✅ Frontend integration
    // You can redirect or send JSON
    // Example: Redirect with token as query
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${FRONTEND_URL}/login-success?token=${token}`);
  }
);

// ================================================
// ✅ 현재 로그인한 사용자의 정보 가져오기
// ================================================

// 사용자 정보 요청 라우트 (JWT 토큰 인증)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    // req.user에 이미 user 정보가 추가되어 있음
    const user = await User.findById(req.user.userId); // req.user.userId는 인증된 사용자 ID

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 정보 반환 (email, username, userId 등)
    res.status(200).json({
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
