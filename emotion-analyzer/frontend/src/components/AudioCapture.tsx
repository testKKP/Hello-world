import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

interface AudioCaptureProps {
  enabled: boolean;
  onAudioChunk: (audioData: ArrayBuffer, timestamp: number) => void;
}

export const AudioCapture: React.FC<AudioCaptureProps> = ({ enabled }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🎤 音频捕获
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip 
          label={enabled ? '录音中...' : '已暂停'} 
          color={enabled ? 'success' : 'default'}
          size="small"
        />
        {enabled && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Box
                key={i}
                sx={{
                  width: 4,
                  height: 20,
                  backgroundColor: 'primary.main',
                  animation: 'pulse 1s infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        音频识别功能暂未实现，将在后续版本中添加
      </Typography>
    </Paper>
  );
};