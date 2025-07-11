# Session API 문서

## 1. 컨테이너 생성
POST /api/session/build-run

Request Body:
{
  "user_id": "string",
  "localPath": "string",
  "imageName": "string",
  "resources": { "cpu": "50%", "memory": "200MB" }
}

Response:
{
  "message": "Container created successfully!",
  "containerId": "string"
}

---

## 2. 세션 목록 조회
GET /api/session?user_id=<user_id>

Response:
[
  {
    "_id": "...",
    "user_id": "...",
    "image_name": "...",
    "container_id": "...",
    "status": "...",
    "resources": {...},
    ...
  }
]

---

## 3. 컨테이너 상태 조회
GET /api/session/status/:containerId

Response:
{
  "containerId": "...",
  "status": "running"
}

---

## 4. 컨테이너 중지
POST /api/session/stop
Body:
{
  "containerId": "...",
  "sessionId": "..."
}

Response:
{
  "message": "Container stopped",
  "updated": {...}
}

---

## 5. 컨테이너 삭제
DELETE /api/session/remove/:containerId

Response:
{
  "message": "Container removed",
  "containerId": "..."
}
