# 情绪语音真实性分析系统

这是一个基于 React 和 FastAPI 的实时表情语音分析系统，能够通过分析用户的面部表情和语音内容来评估其描述的真实性。

## 🌟 主要功能

- **实时视频分析**: 通过摄像头捕获用户面部表情，使用 AI 模型进行情绪识别
- **语音转文字**: 实时将用户语音转换为文字（支持离线大模型）
- **真实性评估**: 结合表情和语言内容，AI 分析用户描述的可信度
- **现代化UI**: 基于 Material-UI 的美观界面，支持深色主题
- **实时通信**: 使用 Socket.IO 实现前后端实时数据传输

## 🏗️ 技术架构

### 前端技术栈
- **React 18** + **TypeScript** - 主要前端框架
- **Material-UI (MUI)** - UI 组件库
- **Socket.IO Client** - 实时通信
- **WebRTC API** - 媒体流获取

### 后端技术栈
- **FastAPI** - 高性能 API 框架
- **Socket.IO** - 实时双向通信
- **OpenCV** - 图像和视频处理
- **NumPy** - 数值计算

### AI/ML 技术栈（计划集成）
- **DeepFace** - 面部表情识别
- **FunASR** - 阿里达摩院离线语音识别（推荐）
- **Whisper** - OpenAI 语音识别（备选）
- **OpenAI GPT-4** - 真实性分析

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Python 3.9+
- 现代浏览器（支持 WebRTC）

### 安装和运行

1. **克隆项目**
```bash
git clone <your-repo-url>
cd emotion-analyzer
```

2. **后端设置**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

pip install -r requirements.txt
python app/main.py
```

3. **前端设置**
```bash
cd frontend
npm install
npm start
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 📱 使用指南

1. **开始分析**
   - 点击"开始分析"按钮
   - 允许浏览器访问摄像头和麦克风
   - 系统将开始实时分析您的表情

2. **查看结果**
   - 左侧显示视频流和实时表情分析
   - 右侧显示语音转录结果
   - 点击"分析真实性"获取综合评估

3. **配置选项**
   - 可单独开启/关闭视频或音频分析
   - 支持清除历史分析结果

## 🔧 离线语音识别配置

### 方案一：FunASR（推荐）
```bash
pip install funasr modelscope
```

### 方案二：Whisper
```bash
pip install openai-whisper
```

### 方案三：SenseVoice
```bash
pip install modelscope
```

详细配置请参考 `技术实现路线图.md`

## 📊 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React前端     │◄──►│  FastAPI后端   │◄──►│   AI分析服务    │
│                 │    │                 │    │                 │
│ - 视频捕获      │    │ - WebSocket     │    │ - DeepFace      │
│ - 音频录制      │    │ - 视频处理      │    │ - 语音识别      │
│ - 实时显示      │    │ - 数据处理      │    │ - LLM分析       │
│ - 用户界面      │    │ - API管理       │    │ - 结果生成      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 隐私声明

- 本系统只在本地处理数据，不上传到外部服务器
- 视频和音频数据仅用于实时分析，不进行存储
- 用户可随时停止分析并清除数据

## 🛠️ 开发指南

### 项目结构
```
emotion-analyzer/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── hooks/          # 自定义hooks
│   │   ├── types/          # TypeScript类型
│   │   └── ...
│   └── package.json
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── main.py         # 主程序
│   └── requirements.txt
└── README.md
```

### 添加新功能

1. **表情识别模型**
   - 在 `backend/app/services/` 中实现新的情绪识别服务
   - 更新 Socket.IO 事件处理器

2. **语音识别集成**
   - 实现 `speech_recognition.py` 服务
   - 配置离线模型

3. **真实性分析**
   - 集成 LLM API
   - 实现多模态分析算法

## 📈 性能优化

- **视频处理**: 控制帧率和分辨率以平衡性能
- **模型推理**: 使用 GPU 加速和模型量化
- **网络传输**: 压缩数据和批量处理
- **内存管理**: 及时清理不需要的数据

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目仅用于技术演示和学习目的。

## 🔗 相关链接

- [技术实现路线图](./技术实现路线图.md)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://reactjs.org/)
- [Material-UI 文档](https://mui.com/)

---

**注意**: 这是一个技术演示项目，当前版本使用模拟数据。完整的 AI 功能需要额外配置相应的模型和 API。