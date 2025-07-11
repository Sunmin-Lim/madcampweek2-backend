# Terminal API 문서

## 1️⃣ Execute Command
POST /api/terminal/execute
Body:
{
  "containerId": "abc123",
  "command": "ls -la"
}
Response:
{
  "result": "..."
}

---

## 2️⃣ Git Command
POST /api/terminal/git
Body:
{
  "containerId": "abc123",
  "gitCmd": "git clone https://github.com/user/repo.git"
}
Response:
{
  "result": "..."
}

---

## 3️⃣ Add SSH Key
POST /api/terminal/ssh-key
Body:
{
  "containerId": "abc123",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n..."
}
Response:
{
  "message": "SSH Key added successfully"
}