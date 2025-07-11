const cron = require('node-cron');
const Session = require('../models/session.model');
const { stopContainer } = require('../services/docker_manager');

async function stopIdleSessions() {
  console.log('[CRON] Checking for idle sessions...');
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2시간
  const idleSessions = await Session.find({ status: 'RUNNING', last_active_at: { $lt: cutoff } });

  for (const session of idleSessions) {
    console.log(`[CRON] Stopping idle container: ${session.container_id}`);
    try {
      await stopContainer(session.container_id);
      session.status = 'STOPPED';
      await session.save();
    } catch (err) {
      console.error(`[CRON] Error stopping ${session.container_id}:`, err);
    }
  }
}

// 매 30분마다 실행
cron.schedule('*/30 * * * *', () => {
  stopIdleSessions();
});
