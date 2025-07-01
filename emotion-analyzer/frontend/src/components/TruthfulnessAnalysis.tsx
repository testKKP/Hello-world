import React from 'react';
import { Paper, Typography, Box, CircularProgress, LinearProgress, Chip } from '@mui/material';
import { TruthfulnessData } from '../types/analysis';

interface TruthfulnessAnalysisProps {
  result: TruthfulnessData | null;
  isActive: boolean;
}

export const TruthfulnessAnalysis: React.FC<TruthfulnessAnalysisProps> = ({ 
  result, 
  isActive 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return '高可信度';
    if (score >= 6) return '中等可信度';
    return '低可信度';
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔍 真实性分析
      </Typography>

      {!isActive && (
        <Typography variant="body2" color="text.secondary">
          启动分析并收集数据后可进行真实性评估
        </Typography>
      )}

      {isActive && !result && (
        <Typography variant="body2" color="text.secondary">
          点击"分析真实性"按钮开始分析
        </Typography>
      )}

      {result && (
        <Box>
          {/* 总分显示 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={(result.score / 10) * 100}
                size={60}
                thickness={4}
                color={getScoreColor(result.score)}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" component="div" color="text.primary">
                  {result.score.toFixed(1)}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Chip 
                label={getScoreLabel(result.score)}
                color={getScoreColor(result.score)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                置信度: {(result.confidence * 100).toFixed(0)}%
              </Typography>
            </Box>
          </Box>

          {/* 分析详情 */}
          <Typography variant="body2" sx={{ mb: 2 }}>
            {result.analysis}
          </Typography>

          {/* 评估因子 */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              评估因子：
            </Typography>
            
            {Object.entries(result.factors).map(([factor, value]) => (
              <Box key={factor} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {factor === 'emotion_consistency' && '表情一致性'}
                    {factor === 'text_coherence' && '语言连贯性'}
                    {factor === 'overall_confidence' && '综合置信度'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(value * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};