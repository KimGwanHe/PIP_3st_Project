from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Depends, Header
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from pymongo import MongoClient
from pymongo.collection import Collection
from pydantic import BaseModel
from passlib.context import CryptContext
from ultralytics import YOLO
from PIL import Image
import jwt
import datetime
import os
import json
import cv2
import numpy as np
import base64
import io
app = FastAPI()
# YOLO 모델 경로 및 로드
model_path = './face_epoch70.pt'
model = YOLO(model_path)  # YOLOv8 모델 로드
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인에서의 접근을 허용합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections = defaultdict(list)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    async def disconnect(self, websocket: WebSocket, room: str):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)
            if not self.active_connections[room]:
                del self.active_connections[room]
                
    async def broadcast(self, message: str, room: str):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                await connection.send_text(message)

    async def close_room(self, room: str):
        """방을 닫고 모든 연결을 종료"""
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                await connection.close()
            del self.active_connections[room]

manager = ConnectionManager()

# 자기 닉네임이랑 클릭한 닉네임을 반환받아서 각각 전달 => 클릭한 닉네임의 이름의 서버에 입장 그리고 자신이 채팅치는 닉네임은 자기자신의 닉네임(세션스토리지에 담겨있는 닉네임)
def decode_base64_to_image(base64_string):
    """Base64 문자열을 이미지로 디코딩"""
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image

def apply_mosaic(image, x, y, w, h, mosaic_scale=0.7):
    """이미지의 지정된 영역에 모자이크 처리를 적용하는 함수"""
    image_np = np.array(image)  # PIL 이미지를 NumPy 배열로 변환
    roi = image_np[y:y+h, x:x+w]  # 관심 영역(ROI) 추출
    roi = cv2.blur(roi, (60, 60))  # 블러(모자이크) 처리
    image_np[y:y+h, x:x+w] = roi
    return Image.fromarray(image_np)  # NumPy 배열을 다시 PIL 이미지로 변환

def detect_objects(image):
    """이미지에서 객체를 검출하고, 결과 이미지를 base64 형식으로 반환하는 함수"""
    results = model.predict(image)
    annotated_image = np.array(image)
    max_area = 0
    max_index = -1
    for i, result in enumerate(results[0].boxes):
        x1, y1, x2, y2 = map(int, result.xyxy[0])  # 객체의 경계 상자 좌표 추출
        area = (x2 - x1) * (y2 - y1)  # 경계 상자의 면적 계산
        if area > max_area:
            max_area = area
            max_index = i
    for i, result in enumerate(results[0].boxes):
        if i != max_index:  # 가장 큰 객체는 건너뜀
            x1, y1, x2, y2 = map(int, result.xyxy[0])
            annotated_image = np.array(apply_mosaic(Image.fromarray(annotated_image), x1, y1, x2-x1, y2-y1))
    final_image = Image.fromarray(annotated_image)
    buffered = io.BytesIO()
    final_image.save(buffered, format="JPEG")
    base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return base64_image

@app.websocket("/ws/{host}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, host: str, client_id: str):
    print('서버 호출')
    print(f'{client_id}님이 {host}님의 방에 입장')
    room = host
    await manager.connect(websocket, room)
    connections[room].append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(json.dumps(data), room)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room)
        print(f"{client_id} 님이 채팅방을 나가셨습니다.")
        if client_id == room:
            await manager.close_room(room)
            del connections[room]
            
@app.get("/connections")
def get_connections():
    return {
        server_name: [str(websocket.client) for websocket in websockets]
        for server_name, websockets in connections.items()
        }
# ==========================================================
# 비밀번호 해시와 JWT 토큰 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "gg"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
# MongoDB 설정
client = MongoClient("몽고디비URL")
db = client["3rd-project"]
collection: Collection = db["user"]
# Pydantic 모델
class User(BaseModel):
    nickname: str
    password: str
class LoginRequest(BaseModel):
    nickname: str
    password: str
class NicknameRequest(BaseModel):
    nickname: str
class ImageData(BaseModel):
    image: str
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
def get_current_user(token: str = Header(...)):
    try:
        if token.startswith("Bearer "):
            token = token[7:]  # "Bearer " 접두사 제거
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
@app.get("/test-connection")
async def test_connection():
    try:
        client.admin.command('ping')
        return {"message": "MongoDB connection successful!"}
    except Exception as e:
        return {"message": "MongoDB connection failed!", "error": str(e)}
@app.post("/user/check-nickname")
async def check_nickname(nickname_request: NicknameRequest):
    # 요청 본문을 직접 받아서 처리
    print("Request data:", nickname_request.model_dump())
    nickname = nickname_request.nickname
    if not nickname:
        raise HTTPException(status_code=400, detail="Nickname is required.")
    existing_user = collection.find_one({"nickname": nickname})
    if existing_user:
        raise HTTPException(status_code=409, detail="중복 닉네임")
    return {"available": True, "message": "Nickname is available."}
@app.post("/user/register")
async def register(user: User):
    existing_user = collection.find_one({"nickname": user.nickname})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    collection.insert_one(user_dict)
    print(f"User registered: Nickname: {user.nickname}, Password (hashed): {hashed_password}")
    return {"message": "User registered successfully"}
@app.post("/user/login")
async def login(request: LoginRequest):
    user = collection.find_one({"nickname": request.nickname})
    if user and pwd_context.verify(request.password, user["password"]):
        access_token = create_access_token(data={"sub": request.nickname})
        print(f"User login: Nickname: {request.nickname}, Password (provided): {request.password}, Token: {access_token}")
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
@app.post("/user/logout")
async def logout():
    # 클라이언트 측에서 토큰을 삭제하도록 유도
    return {"message": "Logout successful. Please delete the token on the client side."}
@app.delete("/user/delete")
async def delete_account(request: Request):
    auth_header = request.headers.get('Authorization')
    if auth_header is None or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Token is required")
    token = auth_header[7:]  # Remove "Bearer " prefix
    username = get_current_user(token)
    result = collection.delete_one({"nickname": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}
@app.post("/user/check-nickname")
async def check_nickname(nickname: str):
    existing_user = collection.find_one({"nickname": nickname})
    if existing_user:
        return {"available": False}
    return {"available": True}
# ==========================================================
@app.post("/stream/normal/{host}/{client_id}")
async def upload_image(data: ImageData, host: str, client_id: str):
    try:
        message = json.dumps({"type": "image", "content": data.image})
        await manager.broadcast(message, host)
    except Exception as e:
        print(f"Error handling image upload: {e}")

@app.post("/stream/blur/{host}/{client_id}")
async def upload_image(data: ImageData, host: str, client_id: str):
    try:
        image = decode_base64_to_image(data.image)
        processed_image = detect_objects(image)
        message = json.dumps({"type": "image", "content": processed_image})
        await manager.broadcast(message, host)
    except Exception as e:
        print(f"Error handling image upload: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
