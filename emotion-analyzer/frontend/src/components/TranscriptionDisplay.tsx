import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { TranscriptionData } from '../types/analysis';

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionData[];
  isActive: boolean;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ 
  transcriptions, 
  isActive 
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🗣️ 语音转录
      </Typography>

      {!isActive && (
        <Typography variant="body2" color="text.secondary">
          启动分析以查看语音识别结果
        </Typography>
      )}

      {isActive && transcriptions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          等待语音输入...
        </Typography>
      )}

      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
        {transcriptions.map((transcription, index) => (
          <Box key={transcription.id} sx={{ mb: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2">
              {transcription.text}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(transcription.timestamp).toLocaleTimeString()}
              </Typography>
              <Chip 
                label={`${(transcription.confidence * 100).toFixed(0)}%`}
                size="small"
                color={transcription.confidence > 0.8 ? 'success' : 'warning'}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {isActive && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          注：语音识别功能使用模拟数据演示
        </Typography>
      )}
    </Paper>
  );
};