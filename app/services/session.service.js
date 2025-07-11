const Session = require('../models/session.model');

// 새 세션 생성
async function createSession(userId, resources) {
  // ✅ 중복 제거
  await Session.deleteMany({ user_id: userId });

  const session = new Session({
    user_id: userId,
    resources
  });
  await session.save();
  return session;
}

// 세션 저장 (빌드+런 완료 후)
async function saveSession({ user_id, image_name, container_id, resources }) {
  // ✅ 중복 제거
  await Session.deleteMany({ user_id });

  const session = new Session({
    user_id,
    image_name,
    container_id,
    status: 'RUNNING',
    resources
  });
  await session.save();
  return session;
}

// 유저별 세션 목록 조회
async function getSessions(userId) {
  return Session.find({ user_id: userId });
}

// 세션 중지 (DB 상태 업데이트)
async function stopSession(sessionId) {
  return Session.findByIdAndUpdate(
    sessionId,
    { status: 'STOPPED', last_active_at: new Date() },
    { new: true }
  );
}

module.exports = {
  createSession,
  saveSession,
  getSessions,
  stopSession
};
