#!/bin/bash

# 情绪语音真实性分析系统启动脚本

echo "🚀 启动情绪语音真实性分析系统..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 项目目录: $SCRIPT_DIR"

# 启动后端
echo "🔧 启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
pip install -r requirements.txt

# 启动后端服务器
echo "🌐 启动FastAPI服务器 (端口 8000)..."
nohup python app/main.py > backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败，请检查日志"
    exit 1
fi

# 启动前端
echo "🎨 启动前端服务..."
cd ../frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动前端开发服务器
echo "🌐 启动React开发服务器 (端口 3000)..."
npm start &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

# 检查前端是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
fi

echo ""
echo "🎉 系统启动完成！"
echo ""
echo "📖 访问地址:"
echo "   前端应用: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "🛑 停止服务:"
echo "   运行: ./stop.sh"
echo ""
echo "📋 进程ID:"
echo "   后端PID: $BACKEND_PID"
echo "   前端PID: $FRONTEND_PID"

# 保存PID到文件
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "📝 日志文件:"
echo "   后端日志: backend/backend.log"
echo "   前端输出: 终端输出"
echo ""
echo "🔍 使用指南:"
echo "   1. 打开浏览器访问 http://localhost:3000"
echo "   2. 点击'开始分析'按钮"
echo "   3. 允许摄像头和麦克风权限"
echo "   4. 开始实时表情语音分析"