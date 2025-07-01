import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { EmotionAnalyzer } from './components/EmotionAnalyzer';

// 创建深色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* 应用栏 */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎭 情绪语音真实性分析系统
          </Typography>
          <Typography variant="body2" color="inherit">
            基于AI的实时分析
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            实时表情与语音分析
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            通过摄像头和麦克风实时捕获您的表情和语音，AI将分析表达内容的真实性
          </Typography>
        </Box>

        {/* 主要分析组件 */}
        <EmotionAnalyzer />
      </Container>

      {/* 页脚信息 */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto', 
          py: 2, 
          px: 2, 
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © 2024 情绪语音真实性分析系统 - 技术演示版本
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
