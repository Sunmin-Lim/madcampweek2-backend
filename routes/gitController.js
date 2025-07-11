const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');  // 경로를 조작하기 위한 모듈

const router = express.Router();

router.post('/clone-repo', (req, res) => {
  const { repoUrl } = req.body;  // 클라이언트에서 보낸 리포지토리 URL 받기

  if (!repoUrl) {
    return res.status(400).json({ message: '리포지토리 URL이 필요합니다.' });
  }

  // Git 리포지토리 이름 추출 (URL에서 .git 제외)
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  
  // 클론할 디렉토리 경로를 F:\workspace\server_manage로 설정
  const repoPath = path.join('F:', 'workspace', 'server_manage', repoName);
  console.log(`클론할 디렉토리 경로: ${repoPath}`);  // 경로 출력 (디버깅용)

  // 리포지토리가 이미 존재하는지 확인
  if (fs.existsSync(repoPath)) {
    return res.status(400).json({ message: `'${repoName}' 디렉토리가 이미 존재합니다.` });
  }

  // 디렉토리 만들기
  fs.mkdirSync(path.join('F:', 'workspace', 'server_manage'), { recursive: true });

  // Git 클론 명령어 실행
  exec(`git clone ${repoUrl} ${repoPath}`, (err, stdout, stderr) => {
    if (err) {
      console.log('Git 클론 오류:', stderr || err.message);  // 에러 로그 출력
      return res.status(500).json({
        message: `클론 오류: ${stderr || err.message}`,
        error: stderr,
      });
    }

    console.log('Git 클론 출력:', stdout);  // 정상 출력 로그 출력
    return res.status(200).json({
      message: 'Git 리포지토리 클론 성공',
      output: stdout,
    });
  });
});

module.exports = router;
