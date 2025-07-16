/*
만들어야 할 것

session 이 만들어진 것은 push를 해주기

git repository를 push하는 기능

사람들의 gotrepo url 을 remote repo에 push해주는 기능 
echo "# BackendArchive" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/BackOverflow/BackendArchive.git
git push -u origin main




일단 지금 해야 할 것 

archive 한 번 올리게 되면 update는 가능하지만 

user_add

*/

/*
지금 현재 default : hanjeongjin  

su - backoverflow 로 바꾸어주기 

비밀번호 같은 관리자 계정은 다 .env로 넘겨주기

기본 terminal은 backoverflow로 바꾸어주기
*/

/*
ssh user_name@server_ip


터미널에서는 정상 작동함
ssh user_name@server_ip


vs code 
ssh user_name@server_ip 자동으로 추가되지만 

/home/hanjeongjin/.ssh/config 에서 "PasswordAuthentication yes"

Host 143.248.183.61
    User dev_user3
    PasswordAuthentication yes

*/

const sudoName = process.env.SUDO_NAME;
const sudoSecret = process.env.SUDO_SECRET;
const User = require('../../../models/User');
const ClonedRepo = require('../../../models/ClonedRepo');

const { exec } = require('child_process');
const path = require('path');


// Helper function to execute shell commands
const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`);
                console.error(`stderr: ${stderr}`);
                reject(`Error: ${stderr}`);
            } else {
                if (stdout.trim() === "") {
                    console.warn(`Warning: No output for command: ${command}`);
                } else {
                    console.log(`Command output: ${stdout}`);
                }
                resolve(stdout);
            }
        });
    });
};
// Get current user (whoami)
const getCurrentUser = async (req, res) => {
    try {
        // Execute the 'whoami' command to get the current user
        const result = await executeCommand('whoami');
        console.log(`Current user: ${result.trim()}`);
        res.status(200).json({ message: 'Current user fetched successfully', user: result.trim() });
    } catch (error) {
        console.error('Error executing whoami command:', error);
        res.status(500).json({ error: 'Failed to get current user' });
    }
};

// Change current user (su - {user_name})
const changeCurrentUser = async (req, res) => {
    const { user_name, user_password } = req.body;  // 클라이언트로부터 사용자 이름과 비밀번호를 받음

    if (!user_name || !user_password) {
        return res.status(400).json({ error: 'User name and password are required' });
    }

    try {
        // Execute the 'su' command to change the current user
        const changeUserCommand = `echo "${user_password}" | su - ${user_name} -c "whoami"`;

        const result = await executeCommand(changeUserCommand); // execute the command
        console.log(`User switched to: ${result.trim()}`);

        res.status(200).json({ message: 'User changed successfully', user: result.trim() });
    } catch (error) {
        console.error('Error executing su command:', error);
        res.status(500).json({ error: 'Failed to change user' });
    }
};


const addUser = async (req, res) => {
    const { user_name, user_password, user_repo_url } = req.body;
    try {
        await executeCommand('pwd');

        /*
        여기에 넣어야 할 기능
        user_name -> user_id를 찾고

        user_id, user_repo_url이 존재할 때 Cloned Repo를 찿고
        해당 Cloned Repo가 can push일 때 

        can_push가 true면 아래 작업이 수행됨, 아닌 경우에는 에러 메시지: 해당 git repository는 정상적으로 작동하지 않아 archive 할 수 없습니다.
        */


        // 1. user_name을 이용해 user_id를 찾기
        const user = await User.findOne({ username: user_name });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user_id = user._id;  // user_id 추출

        // 2. user_id와 user_repo_url이 존재할 때 ClonedRepo를 찾고, can_push가 true인지 확인
        const clonedRepo = await ClonedRepo.findOne({ user_id, repo_url: user_repo_url });
        if (!clonedRepo) {
            return res.status(404).json({ error: 'Cloned repository not found for this user and URL' });
        }

        if (!clonedRepo.can_push) {
            return res.status(400).json({ error: 'The specified Git repository is not working properly. Cannot archive.' });
        }

        // Step 1: Add new user
        console.log(`Adding new user: ${user_name}`);
        const userAddCmd = `echo "${sudoSecret}" | sudo -S useradd --no-create-home --groups archivegroup ${user_name}`;
        const { stdout: userAddStdout, stderr: userAddStderr } = await executeCommand(userAddCmd);
        console.log(userAddStdout);
        console.error(userAddStderr);  // Log any error here

        // Step 2: Set user password
        const passwordCmd = `echo "${user_name}:${user_password}" | sudo chpasswd`;
        const { stdout: passwordStdout, stderr: passwordStderr } = await executeCommand(passwordCmd);
        console.log(passwordStdout);
        console.error(passwordStderr);  // Log any error here

        // Step 3: Create user directory
        const rootPath = `/home/hanjeongjin/Workspace_ubuntu/madcampweek2-server/BackendArchive/`;
        const userHome = `/home/hanjeongjin/Workspace_ubuntu/madcampweek2-server/BackendArchive/${user_name}`;
        console.log(`Creating user directory at ${userHome}`);
        const mkdirCmd = `echo "${sudoSecret}" | sudo -S mkdir -p ${userHome}`;
        const { stdout: mkdirStdout, stderr: mkdirStderr } = await executeCommand(mkdirCmd);
        console.log(mkdirStdout);
        console.error(mkdirStderr);  // Log any error here

        // Step 4: Set permissions
        const chownCmd = `echo "${sudoSecret}" | sudo -S chown ${user_name}:archivegroup ${userHome}`;
        const { stdout: chownStdout, stderr: chownStderr } = await executeCommand(chownCmd);
        console.log(chownStdout);
        console.error(chownStderr);  // Log any error here

        const chmodCmd = `echo "${sudoSecret}" | sudo -S chmod 770 ${userHome}`;
        const { stdout: chmodStdout, stderr: chmodStderr } = await executeCommand(chmodCmd);
        console.log(chmodStdout);
        console.error(chmodStderr);  // Log any error here

        // Step 5: Set home directory for the user
        const usermodCmd = `echo "${sudoSecret}" | sudo -S usermod -d ${userHome} ${user_name}`;
        const { stdout: usermodStdout, stderr: usermodStderr } = await executeCommand(usermodCmd);
        // console.log(usermodStdout);
        // console.error(usermodStderr);  // Log any error here

        // Step 6: Configure Git for repositories

        /*
        이미 있으면 삭제하고 어차피 repoUrl임 <- 이것은 나중에 추가하기
        */
        if (!user_repo_url) {
            return res.status(400).json({ error: 'Repository URL is required.' });
        }

        const repoName = user_repo_url .split('/').pop().replace('.git', ''); // Extract repo name from URL

        const repoPath = path.join(userHome, repoName);
        console.log(`Configuring git for repository path: ${repoPath}`);
        try {

            // // 계정 바꾸기 echo "${user_password}" | su - ${user_name}
            // exec(`git config --global --add safe.directory ${repoPath}`); // 계정 바꾸기 echo "${sudoSecret}" | su - ${user_name}
            // exec(`git clone ${user_repo_url } ${repoPath}`); // 계정 바꾸기 echo "${sudoSecret}" | su - ${user_name}
            
            // console.log(`Git clone executed for ${repoPath}`); 

            // await executeCommand(`git config --global --add safe.directory ${repoPath}`); // 계정 바꾸기 echo "${sudoSecret}" | su - ${user_name}
            // await executeCommand(`cd ${repoPath} && git rm --cached . -rf`); // 계정 바꾸기 echo "${sudoSecret}" | su - ${user_name}
            // console.log(`Git configuration and cache removal for ${repoPath} completed.`);

            try {
                // Step 1: Switch user (using su)
                const changeUserCommand = `echo "${user_password}" | su - ${user_name} -c "whoami"`;
                const userChanged = await executeCommand(changeUserCommand); // switch user to user_name
                console.log(`Switched to user: ${userChanged.trim()}`);
        
                // Step 2: Configure git for repository
                await executeCommand(`echo "${user_password}" | su - ${user_name} -c "git config --global --add safe.directory ${repoPath}"`);
                console.log(`Git config for ${repoPath} completed.`);

                // git config --global --add safe.directory /home/hanjeongjin/Workspace_ubuntu/madcampweek2-server/BackendArchive
                // await executeCommand(`echo "${user_password}" | su - ${user_name} -c "git config --global --add safe.directory ${rootPath}"`);
        
                // Step 3: Clone the repository (Git clone as user)
                await executeCommand(`echo "${user_password}" | su - ${user_name} -c "git clone ${user_repo_url} ${repoPath}"`);
                console.log(`Git clone executed for ${repoPath}`);
        
                // Step 4: Remove cached files (git rm --cached)
                await executeCommand(`echo "${user_password}" | su - ${user_name} -c "cd ${repoPath} && rm -rf .git"`);
                // await executeCommand(`echo "${user_password}" | su - ${user_name} -c "cd ${repoPath} && git rm --cached . -rf"`);
                console.log(`Git configuration and cache removal for ${repoPath} completed.`);
                
            } catch (error) {
                console.error(`Error configuring git for repository: ${repoPath}. Error: ${error.message}`);
            }
        } catch (error) {
            console.error(`Error configuring git for repository: ${repoPath}. Error: ${error.message}`);
        }
        // Return success response
        res.status(200).json({ message: 'User added and repositories configured.' });

    } catch (error) {
        console.error(`Error during user creation process: ${error.message}`);
        console.error(error.stack);  // Log the stack trace for debugging
        res.status(500).json({ error: error.message });
    }
};

// Delete user
const delUser = async (req, res) => {
    const { user_name } = req.body;

    try {
        // Step 1: Delete user under the admin account (SUDO_NAME)
        await executeCommand(`echo "${sudoSecret}" | sudo -S deluser ${user_name}`);
    
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Push changes to archive
const pushToArchive = async (req, res) => {
    const { user_name } = req.body;
    const archiveDir = `/home/hanjeongjin/Workspace_ubuntu/madcampweek2-server/BackendArchive`;

    try {
        // Step 1: Switch to the admin account (SUDO_NAME) before performing any action
        // await executeCommand(`echo "${sudoSecret}" | su - ${sudoName} -c "whoami"`);

        // Step 2: Change directory and commit under the admin account (SUDO_NAME)
        // 여기서 .gitignoer 파일을 수정해주기 archiveDir/.gitignore

        /*
        .gitignore 파일에 자동으로 추가되어야 할 부분은 

        이 내용을 추가해주는 방식으로 
        # "${user_name}" 내부 무시할 디렉토리들
        ${user_name}/.vscode-server/
        ${user_name}/.local/
        ${user_name}/.cache/
        ${user_name}/snap/
        ${user_name}/.vscode/
        ${user_name}/.wget-hsts
        ${user_name}/.ssh
        */
        // Step 1: Create the .gitignore entries for the specific user
        const gitignoreContent = `
        # "${user_name}" internal directories to ignore
        ${user_name}/.vscode-server/
        ${user_name}/.local/
        ${user_name}/.cache/
        ${user_name}/snap/
        ${user_name}/.vscode/
        ${user_name}/.wget-hsts
        ${user_name}/.ssh
        `;

        // Step 2: Append the content to .gitignore
        const appendGitignoreCmd = `echo "${gitignoreContent}" >> ${archiveDir}/.gitignore`;
        await executeCommand(appendGitignoreCmd);
        console.log(`Added user-specific directories to .gitignore for ${user_name}`);
               

        await executeCommand(`cd ${archiveDir} && git add .gitignore ${user_name}/`);  // Git add
        await executeCommand(`cd ${archiveDir} && git commit -m "update by ${user_name} request"`);  // Git commit
        await executeCommand(`cd ${archiveDir} && git push`);  // Git push

        res.status(200).json({ message: 'Changes pushed to archive.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    changeCurrentUser,
    getCurrentUser,
    addUser,
    delUser,
    pushToArchive,
};



