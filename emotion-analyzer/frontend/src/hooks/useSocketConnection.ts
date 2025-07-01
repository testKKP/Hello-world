import { useState, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { EmotionData } from '../types/analysis';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>(`user_${Date.now()}`);

  // 连接Socket.IO
  const connect = useCallback(async () => {
    try {
      if (socketRef.current?.connected) {
        return;
      }

      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
      });

      socketRef.current = socket;

      // 连接事件
      socket.on('connect', () => {
        console.log('Socket.IO连接成功');
        setIsConnected(true);
        setError(null);
        
        // 加入用户房间
        socket.emit('join_room', { user_id: userIdRef.current });
      });

      // 断开连接事件
      socket.on('disconnect', (reason) => {
        console.log('Socket.IO断开连接:', reason);
        setIsConnected(false);
      });

      // 连接错误事件
      socket.on('connect_error', (error) => {
        console.error('Socket.IO连接错误:', error);
        setError(`连接错误: ${error.message}`);
        setIsConnected(false);
      });

      // 等待连接建立
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('连接超时'));
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
      throw err;
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 发送视频帧
  const sendVideoFrame = useCallback((frameData: string, timestamp: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('video_frame', {
        image: frameData,
        timestamp,
        user_id: userIdRef.current,
      });
    }
  }, []);

  // 发送音频数据
  const sendAudioChunk = useCallback((audioData: ArrayBuffer, timestamp: number) => {
    if (socketRef.current?.connected) {
      // 将ArrayBuffer转换为base64
      const uint8Array = new Uint8Array(audioData);
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      const base64Audio = btoa(binaryString);

      socketRef.current.emit('audio_chunk', {
        audio: base64Audio,
        timestamp,
        user_id: userIdRef.current,
      });
    }
  }, []);

  // 请求真实性分析
  const requestTruthfulnessAnalysis = useCallback((emotions: EmotionData[], text: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('analyze_truthfulness', {
        emotions,
        text,
        timestamp: Date.now(),
        user_id: userIdRef.current,
      });
    }
  }, []);

  // 清理连接
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendVideoFrame,
    sendAudioChunk,
    requestTruthfulnessAnalysis,
  };
};