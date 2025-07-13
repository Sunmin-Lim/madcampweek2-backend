// app/api/gitclone/gitclone.controller.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const User = require('../../../models/User'); // User 모델 임포트

async function gitclone(req, res) {
  const { repoUrl } = req.body;  // 클라이언트에서 보낸 리포지토리 URL 받기
  const { userId } = req.user;   // JWT 토큰에서 사용자 ID 받기 (middleware에서 추가)

  if (!repoUrl) {
    return res.status(400).json({ message: '리포지토리 URL이 필요합니다.' });
  }

  try {
    // 사용자의 이름을 기반으로 클론할 디렉토리 경로 생성
    console.log('userId');
    const user = await User.findById(userId);  // 비동기적으로 사용자 정보 가져오기
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Git 리포지토리 이름 추출 (URL에서 .git 제외)
    const repoName = repoUrl.split('/').pop().replace('.git', '');

    // 클론할 디렉토리 경로를 F:\workspace\server_manage\home\username\repoName으로 설정
    const userHomePath = path.join('F:', 'workspace', 'server_manage', 'home', user.username); // 사용자 이름 기반 경로
    const repoPath = path.join(userHomePath, repoName); // 최종 클론될 경로
    console.log(`클론할 디렉토리 경로: ${repoPath}`);  // 경로 출력 (디버깅용)

    // 리포지토리가 이미 존재하는지 확인
    if (fs.existsSync(repoPath)) {
      return res.status(400).json({ message: `'${repoName}' 디렉토리가 이미 존재합니다.` });
    }

    // 디렉토리 만들기 (home/username/ 디렉토리 생성)
    await fs.promises.mkdir(userHomePath, { recursive: true });  // home/username 디렉토리 생성
    
    // Git 클론 명령어 실행
    exec(`git clone ${repoUrl} ${repoPath}`, async (err, stdout, stderr) => {
      if (err) {
        console.log('Git 클론 오류:', stderr || err.message);  // 에러 로그 출력
        return res.status(500).json({
          message: `클론 오류: ${stderr || err.message}`,
          error: stderr,
        });
      }

      // 클론이 성공하면, 해당 리포지토리 정보를 사용자 DB에 저장
      try {
        user.clonedRepos.push(repoUrl);  // 클론된 리포지토리 URL을 배열에 추가
        await user.save(); // DB에 저장

        console.log('Git 클론 출력:', stdout);  // Git 클론 성공 후 출력
        console.log('📌 클론된 리포지토리 목록:', user.clonedRepos);  // 클론된 리포지토리 목록 로그

        return res.status(200).json({
          message: 'Git 리포지토리 클론 성공',
          output: stdout,
          clonedRepos: user.clonedRepos,  // 업데이트된 클론된 리포지토리 목록 반환
        });
      } catch (dbError) {
        console.error('DB 저장 오류:', dbError.message);
        return res.status(500).json({ message: '리포지토리 정보 저장 실패', error: dbError.message });
      }
    });

  } catch (error) {
    console.error('디렉토리 생성 오류:', error.message);
    return res.status(500).json({ message: '디렉토리 생성 중 오류 발생', error: error.message });
  }
}


// 클론된 리포지토리 목록 반환 함수
async function getClonedRepos(req, res) {
    const { userId } = req.params;  // URL 파라미터에서 userId 받기
    console.log(`Fetching cloned repos for userId: ${userId}`);  // userId 출력
  

    try {
      // 해당 userId로 사용자 정보 조회
      const user = await User.findById(userId);
  
      if (!user) {
        console.log('User not found!');
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
  
      console.log('Cloned repos:', user.clonedRepos);  // 클론된 리포지토리 배열 출력

      // 사용자의 클론된 리포지토리 목록 반환
      return res.status(200).json({
        message: '사용자의 클론된 리포지토리 목록',
        clonedRepos: user.clonedRepos,  // 사용자 클론된 리포지토리 배열
      });
    } catch (error) {
      console.error('Error fetching cloned repos:', error.message);
      return res.status(500).json({ message: '클론된 리포지토리 조회 중 오류 발생', error: error.message });
    }
  }
// module.exports = gitclone;

// gitclone 함수 내보내기
module.exports = { gitclone, getClonedRepos };