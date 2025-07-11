const jwt = require('jsonwebtoken');

// 인증 미들웨어 (JWT 토큰을 검증하여 사용자 ID를 req.user에 추가)
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  console.log('Received token:', token);  // 클라이언트가 보낸 토큰 로그

  if (!token) {
    console.log('토큰이 없음');  // 토큰이 없을 때 로그
    return res.status(401).json({ message: '토큰이 필요합니다.' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      console.log('유효하지 않은 토큰', err);  // 토큰 검증 오류 로그
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;  // 사용자 정보를 요청 객체에 추가
    next();
  });
};

module.exports = authenticateToken;
