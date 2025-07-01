#!/bin/bash

# 情绪语音真实性分析系统停止脚本

echo "🛑 停止情绪语音真实性分析系统..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 停止后端进程
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🔧 停止后端服务 (PID: $BACKEND_PID)..."
    
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止"
    else
        echo "⚠️ 后端进程已经停止"
    fi
    
    rm -f .backend.pid
else
    echo "⚠️ 未找到后端进程PID文件"
    # 尝试根据进程名停止
    pkill -f "python.*app/main.py" && echo "✅ 后端服务已停止" || echo "⚠️ 未找到后端进程"
fi

# 停止前端进程
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
    
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止"
    else
        echo "⚠️ 前端进程已经停止"
    fi
    
    rm -f .frontend.pid
else
    echo "⚠️ 未找到前端进程PID文件"
    # 尝试根据进程名停止
    pkill -f "react-scripts.*start" && echo "✅ 前端服务已停止" || echo "⚠️ 未找到前端进程"
fi

# 清理其他相关进程
echo "🧹 清理相关进程..."
pkill -f "node.*react-scripts" 2>/dev/null && echo "✅ 清理React进程"
pkill -f "uvicorn" 2>/dev/null && echo "✅ 清理Uvicorn进程"

# 检查端口占用
echo "🔍 检查端口状态..."
PORT_8000=$(lsof -ti:8000 2>/dev/null)
PORT_3000=$(lsof -ti:3000 2>/dev/null)

if [ -n "$PORT_8000" ]; then
    echo "⚠️ 端口8000仍被占用 (PID: $PORT_8000)"
    echo "   手动停止: kill $PORT_8000"
else
    echo "✅ 端口8000已释放"
fi

if [ -n "$PORT_3000" ]; then
    echo "⚠️ 端口3000仍被占用 (PID: $PORT_3000)"
    echo "   手动停止: kill $PORT_3000"
else
    echo "✅ 端口3000已释放"
fi

echo ""
echo "🎉 系统停止完成！"
echo ""
echo "🚀 重新启动系统:"
echo "   运行: ./start.sh"