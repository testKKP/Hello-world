// 情绪数据类型
export interface EmotionData {
  happy: number;
  sad: number;
  angry: number;
  surprise: number;
  fear: number;
  disgust: number;
  neutral: number;
}

// 转录数据类型
export interface TranscriptionData {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
}

// 真实性分析结果类型
export interface TruthfulnessData {
  score: number;
  confidence: number;
  analysis: string;
  factors: {
    emotion_consistency: number;
    text_coherence: number;
    overall_confidence: number;
  };
}

// Socket.IO消息类型
export interface SocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 媒体流配置
export interface MediaConfig {
  video: {
    width: number;
    height: number;
    frameRate: number;
  };
  audio: {
    sampleRate: number;
    channels: number;
  };
}