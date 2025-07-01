from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import uvicorn
import json
import base64
import numpy as np
import cv2
from typing import Dict, List
import asyncio
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="情绪语音真实性分析系统",
    description="基于面部表情和语音的实时真实性分析系统",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该设置具体的源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建Socket.IO服务器
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# 将Socket.IO集成到FastAPI
socket_app = socketio.ASGIApp(sio, app)

# 连接管理器
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.socket_connections: Dict[str, str] = {}  # session_id -> user_id映射
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"用户 {user_id} 已连接")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"用户 {user_id} 已断开连接")
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

# Socket.IO 事件处理
@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO客户端连接: {sid}")
    await sio.emit('connected', {'message': '连接成功'}, room=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO客户端断开: {sid}")
    if sid in manager.socket_connections:
        user_id = manager.socket_connections[sid]
        del manager.socket_connections[sid]

@sio.event
async def join_room(sid, data):
    """用户加入房间"""
    user_id = data.get('user_id')
    if user_id:
        manager.socket_connections[sid] = user_id
        await sio.enter_room(sid, f"user_{user_id}")
        logger.info(f"用户 {user_id} 加入房间")

@sio.event
async def video_frame(sid, data):
    """处理视频帧数据"""
    try:
        # 解码base64图像数据
        image_data = data.get('image')
        if image_data:
            # 移除data URL前缀
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # 解码图像
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                # 这里调用表情分析服务
                emotion_result = await analyze_emotion_mock(frame)
                
                # 发送分析结果
                await sio.emit('emotion_result', {
                    'emotions': emotion_result,
                    'timestamp': data.get('timestamp')
                }, room=sid)
            
    except Exception as e:
        logger.error(f"视频帧处理错误: {e}")
        await sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
async def audio_chunk(sid, data):
    """处理音频数据"""
    try:
        audio_data = data.get('audio')
        if audio_data:
            # 这里调用语音识别服务
            transcription = await transcribe_audio_mock(audio_data)
            
            if transcription:
                # 发送转录结果
                await sio.emit('transcription_result', {
                    'text': transcription,
                    'timestamp': data.get('timestamp')
                }, room=sid)
                
    except Exception as e:
        logger.error(f"音频处理错误: {e}")
        await sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
async def analyze_truthfulness(sid, data):
    """分析真实性"""
    try:
        emotion_data = data.get('emotions', [])
        text_data = data.get('text', '')
        
        # 调用真实性分析服务
        analysis_result = await analyze_truthfulness_mock(emotion_data, text_data)
        
        # 发送分析结果
        await sio.emit('truthfulness_result', {
            'analysis': analysis_result,
            'timestamp': data.get('timestamp')
        }, room=sid)
        
    except Exception as e:
        logger.error(f"真实性分析错误: {e}")
        await sio.emit('error', {'message': str(e)}, room=sid)

# 模拟服务函数（后续替换为实际实现）
async def analyze_emotion_mock(frame):
    """模拟表情分析"""
    # 这里将集成DeepFace或其他表情识别库
    return {
        'happy': 0.3,
        'sad': 0.1,
        'angry': 0.05,
        'surprise': 0.15,
        'fear': 0.05,
        'disgust': 0.05,
        'neutral': 0.3
    }

async def transcribe_audio_mock(audio_data):
    """模拟语音识别"""
    # 这里将集成Whisper或FunASR
    return "这是模拟的语音识别结果"

async def analyze_truthfulness_mock(emotions, text):
    """模拟真实性分析"""
    # 这里将集成LLM API
    return {
        'score': 7.5,
        'confidence': 0.8,
        'analysis': '基于表情和语言的一致性分析，该陈述具有较高的可信度。',
        'factors': {
            'emotion_consistency': 0.8,
            'text_coherence': 0.75,
            'overall_confidence': 0.8
        }
    }

# REST API 端点
@app.get("/")
async def root():
    return {"message": "情绪语音真实性分析系统 API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "系统运行正常"}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """上传图片进行表情分析"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is not None:
            emotion_result = await analyze_emotion_mock(frame)
            return {"success": True, "emotions": emotion_result}
        else:
            return {"success": False, "error": "无法解析图像"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

# WebSocket端点（可选的额外WebSocket实现）
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 根据消息类型处理
            message_type = message_data.get('type')
            if message_type == 'ping':
                await websocket.send_text(json.dumps({'type': 'pong'}))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)

if __name__ == "__main__":
    uvicorn.run(
        "main:socket_app",  # 使用socket_app而不是app
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )