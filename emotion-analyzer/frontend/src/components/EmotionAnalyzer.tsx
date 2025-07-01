import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CameraAlt,
} from '@mui/icons-material';
import { VideoCapture } from './VideoCapture';
import { AudioCapture } from './AudioCapture';
import { EmotionDisplay } from './EmotionDisplay';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { TruthfulnessAnalysis } from './TruthfulnessAnalysis';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { EmotionData, TranscriptionData, TruthfulnessData } from '../types/analysis';

export const EmotionAnalyzer: React.FC = () => {
  // 状态管理
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [truthfulnessResult, setTruthfulnessResult] = useState<TruthfulnessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Socket.IO连接
  const {
    socket,
    isConnected,
    connect,
    disconnect,
    sendVideoFrame,
    sendAudioChunk,
    requestTruthfulnessAnalysis,
  } = useSocketConnection();

  // 处理Socket.IO事件
  useEffect(() => {
    if (!socket) return;

    // 监听情绪分析结果
    socket.on('emotion_result', (data: { emotions: EmotionData; timestamp: number }) => {
      setCurrentEmotion(data.emotions);
    });

    // 监听语音识别结果
    socket.on('transcription_result', (data: { text: string; timestamp: number }) => {
      const newTranscription: TranscriptionData = {
        id: Date.now().toString(),
        text: data.text,
        timestamp: data.timestamp,
        confidence: 0.9, // 模拟置信度
      };
      setTranscriptions(prev => [...prev.slice(-9), newTranscription]); // 保持最近10条
    });

    // 监听真实性分析结果
    socket.on('truthfulness_result', (data: { analysis: TruthfulnessData; timestamp: number }) => {
      setTruthfulnessResult(data.analysis);
    });

    // 监听错误
    socket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off('emotion_result');
      socket.off('transcription_result');
      socket.off('truthfulness_result');
      socket.off('error');
    };
  }, [socket]);

  // 开始分析
  const handleStartAnalysis = useCallback(async () => {
    try {
      setError(null);
      if (!isConnected) {
        await connect();
      }
      setIsAnalyzing(true);
    } catch (err) {
      setError('连接失败，请检查网络连接');
    }
  }, [isConnected, connect]);

  // 停止分析
  const handleStopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    disconnect();
  }, [disconnect]);

  // 处理视频帧
  const handleVideoFrame = useCallback((frameData: string, timestamp: number) => {
    if (isAnalyzing && videoEnabled && socket) {
      sendVideoFrame(frameData, timestamp);
    }
  }, [isAnalyzing, videoEnabled, socket, sendVideoFrame]);

  // 处理音频数据
  const handleAudioChunk = useCallback((audioData: ArrayBuffer, timestamp: number) => {
    if (isAnalyzing && audioEnabled && socket) {
      sendAudioChunk(audioData, timestamp);
    }
  }, [isAnalyzing, audioEnabled, socket, sendAudioChunk]);

  // 请求真实性分析
  const handleAnalyzeTruthfulness = useCallback(() => {
    if (socket && currentEmotion && transcriptions.length > 0) {
      const recentText = transcriptions.slice(-3).map(t => t.text).join(' ');
      requestTruthfulnessAnalysis([currentEmotion], recentText);
    }
  }, [socket, currentEmotion, transcriptions, requestTruthfulnessAnalysis]);

  // 清除结果
  const handleClearResults = useCallback(() => {
    setTranscriptions([]);
    setTruthfulnessResult(null);
    setCurrentEmotion(null);
    setError(null);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 控制面板 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={isAnalyzing ? "outlined" : "contained"}
                color={isAnalyzing ? "secondary" : "primary"}
                startIcon={isAnalyzing ? <Stop /> : <PlayArrow />}
                onClick={isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                disabled={!isConnected && isAnalyzing}
              >
                {isAnalyzing ? '停止分析' : '开始分析'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleClearResults}
                disabled={isAnalyzing}
              >
                清除结果
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={videoEnabled}
                    onChange={(e) => setVideoEnabled(e.target.checked)}
                    disabled={isAnalyzing}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {videoEnabled ? <Videocam /> : <VideocamOff />}
                    视频
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={audioEnabled}
                    onChange={(e) => setAudioEnabled(e.target.checked)}
                    disabled={isAnalyzing}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {audioEnabled ? <Mic /> : <MicOff />}
                    音频
                  </Box>
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                label={isConnected ? '已连接' : '未连接'}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
              {isAnalyzing && <LinearProgress sx={{ width: 100 }} />}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 主要内容区域 */}
      <Grid container spacing={3}>
        {/* 左侧：视频捕获和情绪显示 */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ mb: 3 }}>
            <VideoCapture
              enabled={videoEnabled && isAnalyzing}
              onFrame={handleVideoFrame}
            />
          </Box>
          
          <EmotionDisplay
            emotions={currentEmotion}
            isActive={isAnalyzing && videoEnabled}
          />
        </Grid>

        {/* 右侧：音频捕获、转录和分析 */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ mb: 3 }}>
            <AudioCapture
              enabled={audioEnabled && isAnalyzing}
              onAudioChunk={handleAudioChunk}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TranscriptionDisplay
              transcriptions={transcriptions}
              isActive={isAnalyzing && audioEnabled}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleAnalyzeTruthfulness}
              disabled={!currentEmotion || transcriptions.length === 0 || !isAnalyzing}
              sx={{ mb: 2 }}
            >
              分析真实性
            </Button>
            
            <TruthfulnessAnalysis
              result={truthfulnessResult}
              isActive={isAnalyzing}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};