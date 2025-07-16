const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios');

const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../../models/User');
const authenticateToken = require('../../middleware/authMiddleware');

//const authenticateToken = require('../../../middleware/authMiddleware'); // 미들웨어 임포트



// require('./githubStrategy'); // <-- Loads the passport GitHub strategy


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
    const newUser = new User({ email, password_hash, username: username.toLowerCase(), logout: true }); // 로그아웃 상태 기본값 true로 설정
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

    user.logout = false; // 로그인 상태로 변경
    await user.save(); // 사용자 정보 업데이트

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('❌ [LOGIN] 에러:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * ================================================
 * ✅ Email/Password 로그아웃
 * ================================================
 */
// 로그아웃 라우터
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      console.log(`👋 [LOGOUT] ${user.username} (${user.email}) 로그아웃 처리 실패`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.logout = true;
    await user.save();

    console.log(`👋 [LOGOUT] ${user.username} (${user.email}) 로그아웃 처리 완료`);

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('❌ 로그아웃 에러:', error);
    res.status(500).json({ message: 'Server error during logout' });
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


// router.get('/github/callback', (req, res) => {
//   const code = req.query.code;

//   if (!code) {
//     return res.status(400).send('GitHub code not found');
//   }

//   const appRedirect = `myapp://callback?code=${code}`;

//   res.send(`
//     <html>
//       <head>
//         <title>앱으로 이동 중...</title>
//         <script>
//           // 2초 기다렸다가 앱 열기
//           setTimeout(function() {
//             window.location = '${appRedirect}';
//           }, 2000); // 2000ms = 2초

//           // 5초 후에도 앱이 안 열리면 안내 메시지 보여주기
//           setTimeout(function() {
//             document.body.innerHTML = '<h3>앱이 자동으로 열리지 않으면 직접 실행해 주세요.</h3>';
//           }, 5000);
//         </script>
//       </head>
//       <body>
//         <h3>GitHub 로그인 완료! 앱으로 돌아가는 중입니다...</h3>
//       </body>
//     </html>
//   `);
// });


// 👉 Flutter에서 POST로 code 전달
router.post('/github/code', async (req, res) => {
  const { code } = req.body;

  try {
    // 1. GitHub에 access_token 요청
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { accept: 'application/json' } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ message: 'GitHub access token 요청 실패' });
    }

    // 2. GitHub 사용자 정보 요청
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });

    const profile = userRes.data;

    // 3. 사용자 DB 등록 or 조회
    let user = await User.findOne({ githubId: profile.id });

    if (!user) {
      // GitHub ID가 없다면 새 사용자 생성
      user = await User.create({
        email: profile.email || `${profile.login}@github.com`, // email이 null일 수 있음
        username: profile.login.toLowerCase(),
        logout: false, // 로그인 상태로 처리
        githubId: profile.id,
        authType: 'github',
      });
      console.log('✅ 새 사용자 생성 완료:', user);

    } else {
      // 이미 사용자 존재 시, 로그인 상태로 설정
      user.logout = false; // 로그인 상태로 변경
      await user.save(); // 사용자 정보 업데이트
    }

    // 4. JWT 발급
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: '1h',
    });

    // 5. Flutter로 응답
    return res.status(200).json({ token });

  } catch (error) {
    console.error('GitHub OAuth 실패:', error);
    return res.status(500).json({ message: 'GitHub OAuth 처리 중 오류' });
  }
});




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
