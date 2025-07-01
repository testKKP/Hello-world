import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import { EmotionData } from '../types/analysis';

interface EmotionDisplayProps {
  emotions: EmotionData | null;
  isActive: boolean;
}

const emotionLabels: Record<keyof EmotionData, string> = {
  happy: '😊 开心',
  sad: '😢 悲伤',
  angry: '😠 愤怒',
  surprise: '😮 惊讶',
  fear: '😨 恐惧',
  disgust: '🤢 厌恶',
  neutral: '😐 中性',
};

const emotionColors: Record<keyof EmotionData, string> = {
  happy: '#4caf50',
  sad: '#2196f3',
  angry: '#f44336',
  surprise: '#ff9800',
  fear: '#9c27b0',
  disgust: '#795548',
  neutral: '#607d8b',
};

export const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotions, isActive }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        😊 表情分析
      </Typography>

      {!isActive && (
        <Typography variant="body2" color="text.secondary">
          启动分析以查看表情识别结果
        </Typography>
      )}

      {isActive && !emotions && (
        <Typography variant="body2" color="text.secondary">
          正在分析表情...
        </Typography>
      )}

      {emotions && (
        <Box>
          {Object.entries(emotions).map(([emotion, value]) => (
            <Box key={emotion} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {emotionLabels[emotion as keyof EmotionData]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(value * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={value * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: emotionColors[emotion as keyof EmotionData],
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};