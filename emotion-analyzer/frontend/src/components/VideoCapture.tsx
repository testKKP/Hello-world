import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

interface VideoCaptureProps {
  enabled: boolean;
  onFrame: (frameData: string, timestamp: number) => void;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({ enabled, onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 开始视频捕获
  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 30 },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 开始帧捕获
      startFrameCapture();
      setError(null);
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
      console.error('摄像头访问失败:', err);
    }
  };

  // 停止视频捕获
  const stopCapture = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 开始帧捕获
  const startFrameCapture = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      captureFrame();
    }, 200); // 每200ms捕获一帧，约5fps
  };

  // 捕获单帧
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到画布
    ctx.drawImage(video, 0, 0);

    // 获取base64图像数据
    const frameData = canvas.toDataURL('image/jpeg', 0.8);
    const timestamp = Date.now();

    // 发送帧数据
    onFrame(frameData, timestamp);
  };

  // 监听enabled状态变化
  useEffect(() => {
    if (enabled) {
      startCapture();
    } else {
      stopCapture();
    }

    return () => {
      stopCapture();
    };
  }, [enabled]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        📹 视频捕获
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative', width: '100%', maxWidth: 640 }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#000',
            borderRadius: 8,
          }}
          muted
          playsInline
        />
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {!enabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <Typography color="white">
              视频已暂停
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};