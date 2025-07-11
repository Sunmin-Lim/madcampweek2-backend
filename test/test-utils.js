const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  // 사용자 ID를 기반으로 JWT 토큰을 생성합니다.
  const payload = { userId };
  return jwt.sign(payload, 'your_secret_key', { expiresIn: '1h' }); // 1시간 만료
};

module.exports = generateToken;